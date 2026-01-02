import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Pen, Highlighter, Eraser, Type, Square, Circle, Undo, Redo,
  Save, Minus, RotateCcw, MousePointer,
  Bookmark, BookmarkCheck, Layers, StickyNote,
  Check, Trash2, ArrowRight, Maximize2, Minimize2, Menu,
  FileText, CheckSquare, Star, Heart, Triangle, Info, ExternalLink,
  Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// PDF.js library for rendering PDFs
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const COLORS = [
  '#000000', '#374151', '#DC2626', '#EA580C', '#F59E0B',
  '#16A34A', '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6',
  '#1E40AF', '#7C3AED', '#DB2777', '#059669', '#D97706'
];

const HIGHLIGHTER_COLORS = [
  'rgba(250, 204, 21, 0.5)', 'rgba(74, 222, 128, 0.5)', 
  'rgba(251, 146, 60, 0.5)', 'rgba(244, 114, 182, 0.5)',
  'rgba(96, 165, 250, 0.5)', 'rgba(167, 139, 250, 0.5)',
  'rgba(248, 113, 113, 0.5)', 'rgba(52, 211, 153, 0.5)'
];

const STICKY_COLORS = [
  '#FEF3C7', '#DBEAFE', '#FCE7F3', '#D1FAE5', '#FEE2E2', '#E0E7FF'
];

const BRUSH_SIZES = [1, 2, 4, 6, 8, 12, 16, 24];

const SHAPE_TYPES = ['rectangle', 'circle', 'line', 'arrow', 'star', 'heart', 'triangle', 'checkmark'];

export default function PDFWorkbookViewer({ tool, onClose }) {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const pdfDocRef = useRef(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(tool.pages || 62);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);
  
  // Tool states
  const [activeTool, setActiveTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHTER_COLORS[0]);
  const [brushSize, setBrushSize] = useState(4);
  const [selectedShape, setSelectedShape] = useState('rectangle');
  
  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  
  // Data states
  const [annotations, setAnnotations] = useState({});
  const [textFields, setTextFields] = useState({});
  const [shapes, setShapes] = useState({});
  const [stickyNotes, setStickyNotes] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [checkboxes, setCheckboxes] = useState({});
  
  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI states
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [activeTextField, setActiveTextField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load PDF.js library
  useEffect(() => {
    const loadPdfJs = async () => {
      if (window.pdfjsLib) {
        setPdfJsLoaded(true);
        return;
      }

      try {
        // Load PDF.js script
        const script = document.createElement('script');
        script.src = `${PDFJS_CDN}/pdf.min.js`;
        script.async = true;
        
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
          setPdfJsLoaded(true);
        };
        
        script.onerror = () => {
          setPdfError('Failed to load PDF viewer');
          setPdfLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading PDF.js:', err);
        setPdfError('Failed to load PDF viewer');
        setPdfLoading(false);
      }
    };

    loadPdfJs();
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!pdfJsLoaded || !tool.pdfUrl) return;

    const loadPdf = async () => {
      setPdfLoading(true);
      setPdfError(null);

      try {
        const loadingTask = window.pdfjsLib.getDocument({
          url: tool.pdfUrl,
          cMapUrl: `${PDFJS_CDN}/cmaps/`,
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setPdfLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setPdfError('Failed to load PDF. Try opening it in a new tab.');
        setPdfLoading(false);
      }
    };

    loadPdf();
  }, [pdfJsLoaded, tool.pdfUrl]);

  // Render PDF page
  useEffect(() => {
    if (!pdfDocRef.current || !pdfCanvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        const canvas = pdfCanvasRef.current;
        const ctx = canvas.getContext('2d');

        // Calculate scale to fit page (816x1056 is roughly letter size at 96dpi)
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(816 / viewport.width, 1056 / viewport.height);
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
        }).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [currentPage, pdfDocRef.current]);

  // Load saved data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(`workbook_${tool.id}_data`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setAnnotations(data.annotations || {});
        setTextFields(data.textFields || {});
        setShapes(data.shapes || {});
        setStickyNotes(data.stickyNotes || {});
        setBookmarks(data.bookmarks || []);
        setCheckboxes(data.checkboxes || {});
        setLastSaved(data.lastSaved);
      }
    } catch (e) {
      console.error('Error loading saved data:', e);
    }
  }, [tool.id]);

  // Save all data
  const saveProgress = useCallback(async () => {
    setIsSaving(true);
    try {
      const data = {
        annotations,
        textFields,
        shapes,
        stickyNotes,
        bookmarks,
        checkboxes,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`workbook_${tool.id}_data`, JSON.stringify(data));
      setLastSaved(data.lastSaved);
      toast.success('Progress saved!');
    } catch (e) {
      toast.error('Error saving progress');
    }
    setIsSaving(false);
  }, [tool.id, annotations, textFields, shapes, stickyNotes, bookmarks, checkboxes]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const data = {
        annotations,
        textFields,
        shapes,
        stickyNotes,
        bookmarks,
        checkboxes,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`workbook_${tool.id}_data`, JSON.stringify(data));
    }, 30000);
    return () => clearInterval(interval);
  }, [tool.id, annotations, textFields, shapes, stickyNotes, bookmarks, checkboxes]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Redraw annotations for current page
    redrawCanvas();
  }, [currentPage]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw saved annotation image if exists
    if (annotations[currentPage]) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = annotations[currentPage];
    }
  }, [currentPage, annotations]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    
    if (activeTool === 'select') return;
    
    if (activeTool === 'text') {
      addTextField(coords.x, coords.y);
      return;
    }
    
    if (activeTool === 'checkbox') {
      addCheckbox(coords.x, coords.y);
      return;
    }
    
    setIsDrawing(true);
    setLastPoint(coords);
    setCurrentPath([coords]);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    if (activeTool === 'pen') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = brushSize * 6;
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.5;
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 4;
      ctx.globalAlpha = 1;
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (activeTool === 'shape') {
      // Draw shape preview on overlay canvas
      const overlay = overlayCanvasRef.current;
      const overlayCtx = overlay.getContext('2d');
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      
      drawShape(overlayCtx, lastPoint, coords, selectedShape);
    } else {
      // Smooth drawing with quadratic curves
      if (lastPoint) {
        const midPoint = {
          x: (lastPoint.x + coords.x) / 2,
          y: (lastPoint.y + coords.y) / 2
        };
        
        ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, midPoint.x, midPoint.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midPoint.x, midPoint.y);
      }
      
      setCurrentPath(prev => [...prev, coords]);
    }
    
    setLastPoint(coords);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (activeTool === 'shape' && lastPoint) {
      const coords = lastPoint;
      // Draw final shape on main canvas
      drawShape(ctx, currentPath[0], coords, selectedShape);
      
      // Clear overlay
      const overlay = overlayCanvasRef.current;
      const overlayCtx = overlay.getContext('2d');
      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    }
    
    ctx.stroke();
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    
    // Save canvas state
    const newAnnotation = canvas.toDataURL();
    setAnnotations(prev => ({
      ...prev,
      [currentPage]: newAnnotation
    }));
    
    // Add to history
    addToHistory({ type: 'draw', page: currentPage, data: newAnnotation });
    
    setIsDrawing(false);
    setLastPoint(null);
    setCurrentPath([]);
  };

  const drawShape = (ctx, start, end, shapeType) => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    ctx.fillStyle = 'transparent';
    ctx.globalCompositeOperation = 'source-over';
    
    const width = end.x - start.x;
    const height = end.y - start.y;
    
    ctx.beginPath();
    
    switch (shapeType) {
      case 'rectangle':
        ctx.rect(start.x, start.y, width, height);
        break;
      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        ctx.arc(start.x + width / 2, start.y + height / 2, radius, 0, Math.PI * 2);
        break;
      case 'line':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
      case 'arrow':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        // Arrow head
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 15;
        ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
        break;
      case 'star':
        drawStar(ctx, start.x + width / 2, start.y + height / 2, 5, Math.abs(width) / 2, Math.abs(width) / 4);
        break;
      case 'heart':
        drawHeart(ctx, start.x + width / 2, start.y, Math.abs(width));
        break;
      case 'triangle':
        ctx.moveTo(start.x + width / 2, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(start.x, end.y);
        ctx.closePath();
        break;
      case 'checkmark':
        ctx.moveTo(start.x, start.y + height / 2);
        ctx.lineTo(start.x + width / 3, end.y);
        ctx.lineTo(end.x, start.y);
        break;
    }
    
    ctx.stroke();
  };

  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawHeart = (ctx, x, y, size) => {
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
  };

  const addTextField = (x, y) => {
    const id = `text_${Date.now()}`;
    setTextFields(prev => ({
      ...prev,
      [currentPage]: [
        ...(prev[currentPage] || []),
        { id, x, y, value: '', color: currentColor, fontSize: brushSize * 3 + 12 }
      ]
    }));
    setActiveTextField(id);
  };

  const updateTextField = (id, updates) => {
    setTextFields(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  const deleteTextField = (id) => {
    setTextFields(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(field => field.id !== id)
    }));
  };

  const addCheckbox = (x, y) => {
    const id = `cb_${Date.now()}`;
    setCheckboxes(prev => ({
      ...prev,
      [currentPage]: [
        ...(prev[currentPage] || []),
        { id, x, y, checked: false }
      ]
    }));
  };

  const toggleCheckbox = (id) => {
    setCheckboxes(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(cb =>
        cb.id === id ? { ...cb, checked: !cb.checked } : cb
      )
    }));
  };

  const deleteCheckbox = (id) => {
    setCheckboxes(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(cb => cb.id !== id)
    }));
  };

  const addStickyNote = () => {
    const id = `note_${Date.now()}`;
    setStickyNotes(prev => ({
      ...prev,
      [currentPage]: [
        ...(prev[currentPage] || []),
        { id, x: 100, y: 100, text: '', color: STICKY_COLORS[0], width: 200, height: 150 }
      ]
    }));
  };

  const updateStickyNote = (id, updates) => {
    setStickyNotes(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).map(note =>
        note.id === id ? { ...note, ...updates } : note
      )
    }));
  };

  const deleteStickyNote = (id) => {
    setStickyNotes(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(note => note.id !== id)
    }));
  };

  const addToHistory = (action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(action);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    setHistoryIndex(historyIndex - 1);
    // Restore previous state
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (historyIndex > 0 && history[historyIndex - 1]) {
      const prevState = history[historyIndex - 1];
      if (prevState.data) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = prevState.data;
      }
    }
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    const nextState = history[historyIndex + 1];
    if (nextState && nextState.data) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = nextState.data;
    }
  };

  const clearPage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setAnnotations(prev => {
      const newAnnotations = { ...prev };
      delete newAnnotations[currentPage];
      return newAnnotations;
    });
    setTextFields(prev => ({ ...prev, [currentPage]: [] }));
    setStickyNotes(prev => ({ ...prev, [currentPage]: [] }));
    setCheckboxes(prev => ({ ...prev, [currentPage]: [] }));
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(p => p !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage].sort((a, b) => a - b));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'text', icon: Type, label: 'Text Field' },
    { id: 'shape', icon: Square, label: 'Shapes' },
    { id: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
    { id: 'note', icon: StickyNote, label: 'Sticky Note', action: addStickyNote },
  ];

  const shapeIcons = {
    rectangle: Square,
    circle: Circle,
    line: Minus,
    arrow: ArrowRight,
    star: Star,
    heart: Heart,
    triangle: Triangle,
    checkmark: Check
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col"
    >
      {/* Header Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 p-2 md:p-3 flex flex-wrap items-center justify-between gap-2 shadow-xl"
          >
            {/* Left section */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
              <h2 className="text-white font-semibold text-sm md:text-lg truncate max-w-[100px] md:max-w-xs">
                {tool.title}
              </h2>
              {lastSaved && (
                <span className="text-white/50 text-xs hidden md:block">
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Drawing Tools */}
            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 overflow-x-auto">
              {tools.map((t) => (
                <Button
                  key={t.id}
                  variant="ghost"
                  size="sm"
                  onClick={t.action || (() => {
                    setActiveTool(t.id);
                    if (t.id === 'shape') setShowShapePicker(true);
                  })}
                  className={`relative ${activeTool === t.id ? 'bg-white text-purple-900 shadow-lg' : 'text-white hover:bg-white/20'}`}
                  title={t.label}
                >
                  <t.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>

            {/* Shape Picker */}
            <AnimatePresence>
              {showShapePicker && activeTool === 'shape' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-16 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl p-3 z-50"
                >
                  <p className="text-xs font-medium text-gray-600 mb-2">Select Shape</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SHAPE_TYPES.map((shape) => {
                      const Icon = shapeIcons[shape] || Square;
                      return (
                        <button
                          key={shape}
                          onClick={() => {
                            setSelectedShape(shape);
                            setShowShapePicker(false);
                          }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            selectedShape === shape 
                              ? 'bg-purple-100 border-2 border-purple-500' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-5 h-5 text-gray-700" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Color Picker */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-white hover:bg-white/20"
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-inner"
                  style={{ backgroundColor: activeTool === 'highlighter' ? highlightColor : currentColor }}
                />
              </Button>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl p-4 z-50 min-w-[200px]"
                  >
                    <p className="text-xs font-semibold text-gray-700 mb-3">
                      {activeTool === 'highlighter' ? '🖍️ Highlighter Color' : '🖊️ Pen Color'}
                    </p>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {(activeTool === 'highlighter' ? HIGHLIGHTER_COLORS : COLORS).map((color) => (
                        <motion.button
                          key={color}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (activeTool === 'highlighter') {
                              setHighlightColor(color);
                            } else {
                              setCurrentColor(color);
                            }
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            (activeTool === 'highlighter' ? highlightColor : currentColor) === color
                              ? 'border-purple-500 ring-2 ring-purple-300'
                              : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-gray-700 mb-2">📏 Brush Size</p>
                    <div className="flex flex-wrap gap-2">
                      {BRUSH_SIZES.map((size) => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.1 }}
                          onClick={() => setBrushSize(size)}
                          className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all ${
                            brushSize === size ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="rounded-full bg-gray-800"
                            style={{ width: Math.min(size + 2, 20), height: Math.min(size + 2, 20) }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="text-white hover:bg-white/20 disabled:opacity-30"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="text-white hover:bg-white/20 disabled:opacity-30"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPage}
                className="text-white hover:bg-white/20"
                title="Clear Page"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
                className="text-white hover:bg-white/20"
                title="Bookmark"
              >
                {bookmarks.includes(currentPage) ? (
                  <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookmarks(!showBookmarks)}
                className="text-white hover:bg-white/20"
                title="View Bookmarks"
              >
                <Layers className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={saveProgress}
                disabled={isSaving}
                className="text-white hover:bg-white/20"
                title="Save Progress"
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 hidden md:flex"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 15))}
                className="text-white hover:bg-white/20 p-1"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-xs min-w-[40px] text-center font-medium">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(300, zoom + 15))}
                className="text-white hover:bg-white/20 p-1"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Toolbar Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowToolbar(!showToolbar)}
        className="absolute top-2 right-2 z-50 bg-white/20 hover:bg-white/30 text-white md:hidden"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Bookmarks Panel */}
      <AnimatePresence>
        {showBookmarks && bookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 flex items-center gap-2 overflow-x-auto"
          >
            <span className="text-white text-sm font-semibold flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              Bookmarks:
            </span>
            {bookmarks.map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`text-white hover:bg-white/20 ${currentPage === page ? 'bg-white/30' : ''}`}
              >
                Page {page}
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <div
        ref={pdfContainerRef}
        className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-2 md:p-4"
      >
        <motion.div
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center'
          }}
          animate={{ scale: zoom / 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* PDF Background - Rendered with PDF.js */}
          <div className="w-[816px] h-[1056px] relative bg-white">
            {/* PDF Canvas Layer */}
            <canvas
              ref={pdfCanvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Loading State */}
            {pdfLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
                  <p className="text-gray-600 font-medium">Loading PDF...</p>
                  <p className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</p>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {pdfError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                <div className="text-center max-w-sm p-6">
                  <Info className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                  <p className="text-gray-700 font-medium mb-2">{pdfError}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    The PDF might be loading or there may be a connection issue.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        setPdfError(null);
                        setPdfLoading(true);
                        // Re-trigger PDF load
                        if (window.pdfjsLib && tool.pdfUrl) {
                          window.pdfjsLib.getDocument(tool.pdfUrl).promise.then(pdf => {
                            pdfDocRef.current = pdf;
                            setTotalPages(pdf.numPages);
                            setPdfLoading(false);
                          }).catch(() => {
                            setPdfError('Failed to reload PDF');
                            setPdfLoading(false);
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => window.open(tool.pdfUrl, '_blank')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open PDF in New Tab
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* No PDF URL fallback */}
            {!tool.pdfUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" />
                  <p className="text-xl font-semibold">Page {currentPage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Drawing Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={816}
            height={1056}
            className="absolute inset-0"
            style={{
              touchAction: 'none',
              cursor: activeTool === 'select' ? 'default' : 
                      activeTool === 'pen' ? 'crosshair' :
                      activeTool === 'highlighter' ? 'crosshair' :
                      activeTool === 'eraser' ? 'cell' :
                      activeTool === 'text' ? 'text' : 'crosshair',
              pointerEvents: activeTool === 'select' ? 'none' : 'auto'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Shape Preview Overlay Canvas */}
          <canvas
            ref={overlayCanvasRef}
            width={816}
            height={1056}
            className="absolute inset-0 pointer-events-none"
          />

          {/* Text Fields */}
          {(textFields[currentPage] || []).map((field) => (
            <motion.div
              key={field.id}
              drag={activeTool === 'select'}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                updateTextField(field.id, {
                  x: field.x + info.offset.x,
                  y: field.y + info.offset.y
                });
              }}
              className="absolute group"
              style={{ left: field.x, top: field.y }}
            >
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateTextField(field.id, { value: e.target.value })}
                placeholder="Type here..."
                className="bg-transparent border-b-2 border-dashed border-purple-400 focus:border-purple-600 outline-none px-1 min-w-[100px]"
                style={{
                  color: field.color,
                  fontSize: field.fontSize
                }}
                autoFocus={activeTextField === field.id}
              />
              <button
                onClick={() => deleteTextField(field.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}

          {/* Checkboxes */}
          {(checkboxes[currentPage] || []).map((cb) => (
            <motion.div
              key={cb.id}
              drag={activeTool === 'select'}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                setCheckboxes(prev => ({
                  ...prev,
                  [currentPage]: (prev[currentPage] || []).map(c =>
                    c.id === cb.id ? { ...c, x: c.x + info.offset.x, y: c.y + info.offset.y } : c
                  )
                }));
              }}
              className="absolute group cursor-pointer"
              style={{ left: cb.x, top: cb.y }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleCheckbox(cb.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  cb.checked 
                    ? 'bg-green-500 border-green-600' 
                    : 'bg-white border-gray-400 hover:border-purple-500'
                }`}
              >
                {cb.checked && <Check className="w-4 h-4 text-white" />}
              </motion.button>
              <button
                onClick={() => deleteCheckbox(cb.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}

          {/* Sticky Notes */}
          {(stickyNotes[currentPage] || []).map((note) => (
            <motion.div
              key={note.id}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => {
                updateStickyNote(note.id, {
                  x: note.x + info.offset.x,
                  y: note.y + info.offset.y
                });
              }}
              className="absolute shadow-lg rounded-lg overflow-hidden cursor-move group"
              style={{
                left: note.x,
                top: note.y,
                width: note.width,
                backgroundColor: note.color
              }}
            >
              <div className="p-2 flex justify-between items-center bg-black/10">
                <div className="flex gap-1">
                  {STICKY_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateStickyNote(note.id, { color })}
                      className={`w-4 h-4 rounded-full border ${note.color === color ? 'ring-2 ring-gray-600' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => deleteStickyNote(note.id)}
                  className="hover:bg-black/20 rounded p-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(e) => updateStickyNote(note.id, { text: e.target.value })}
                className="w-full p-3 text-sm bg-transparent outline-none resize-none"
                style={{ minHeight: note.height - 40 }}
                placeholder="Write your note..."
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 p-2 md:p-3 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden md:inline ml-1">Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            className="w-14 text-center bg-white/10 text-white border border-white/30 rounded-lg px-2 py-1 font-medium"
          />
          <span className="text-white font-medium">of {totalPages}</span>
          
          {/* Quick Page Jump */}
          <div className="hidden md:flex items-center gap-1 ml-4">
            {[1, Math.floor(totalPages / 4), Math.floor(totalPages / 2), Math.floor(totalPages * 3 / 4), totalPages]
              .filter((v, i, a) => a.indexOf(v) === i)
              .map(page => (
                <Button
                  key={page}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`text-white hover:bg-white/20 text-xs px-2 ${currentPage === page ? 'bg-white/20' : ''}`}
                >
                  {page}
                </Button>
              ))}
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="text-white hover:bg-white/20 disabled:opacity-30"
        >
          <span className="hidden md:inline mr-1">Next</span>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Tool Tips */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
        <AnimatePresence>
          {activeTool !== 'select' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full"
            >
              {activeTool === 'pen' && '🖊️ Draw on the page'}
              {activeTool === 'highlighter' && '🖍️ Highlight text'}
              {activeTool === 'eraser' && '🧹 Erase annotations'}
              {activeTool === 'text' && '📝 Click to add text'}
              {activeTool === 'shape' && `📐 Draw ${selectedShape}`}
              {activeTool === 'checkbox' && '☑️ Click to add checkbox'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}