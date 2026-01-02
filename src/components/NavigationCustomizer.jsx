
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GripVertical, Eye, EyeOff, RotateCcw, Sparkles } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { useNotifications } from "@/components/SoundManager";

export default function NavigationCustomizer({ 
  navigationItems,
  currentOrder, 
  hiddenItems = [], 
  onOrderChange, 
  onVisibilityChange,
  onReset,
  pageVisits = {},
  onSaveComplete // New prop for callback
}) {
  const { playSound } = useNotifications();
  const [localOrder, setLocalOrder] = useState(currentOrder);
  const [localHidden, setLocalHidden] = useState(hiddenItems);
  const [isDragging, setIsDragging] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    setLocalOrder(currentOrder);
    setLocalHidden(hiddenItems);
  }, [currentOrder, hiddenItems]);

  const handleDragStart = () => {
    setIsDragging(true);
    playSound('click');
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    if (result.source.index === result.destination.index) return;
    
    playSound('pop');
    const items = Array.from(localOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalOrder(items);
  };

  const toggleItemVisibility = (itemTitle) => {
    playSound('pop');
    if (localHidden.includes(itemTitle)) {
      setLocalHidden(localHidden.filter(t => t !== itemTitle));
    } else {
      setLocalHidden([...localHidden, itemTitle]);
    }
  };

  const handleSave = async () => {
    playSound('success');
    // We use Promise.all to wait for both operations to complete
    await Promise.all([
      onOrderChange(localOrder),
      onVisibilityChange(localHidden)
    ]);

    // After both have completed, call the onSaveComplete callback
    if (onSaveComplete) {
      onSaveComplete();
    }
  };

  const handleReset = () => {
    playSound('click');
    const allAvailableItems = navigationItems.map(item => item.title);
    setLocalOrder(allAvailableItems);
    setLocalHidden([]);
    onReset();
  };

  const sortByUsage = () => {
    playSound('success');
    const sorted = [...localOrder].sort((a, b) => {
      const usageA = pageVisits[a] || 0;
      const usageB = pageVisits[b] || 0;
      return usageB - usageA;
    });
    setLocalOrder(sorted);
  };

  const getNavItem = (title) => {
    return navigationItems.find(item => item.title === title) || { 
      title, 
      icon: null, 
      gradient: 'from-gray-400 to-gray-600',
      description: ''
    };
  };

  const getVisitCount = (title) => {
    return pageVisits[title] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Auto-Sort Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">Smart Auto-Sort</h4>
              <p className="text-sm text-purple-700">
                Automatically organize by your most-visited pages
              </p>
            </div>
          </div>
          <Button
            onClick={sortByUsage}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
          >
            Sort Now
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>💡 How to use:</strong> Grab the <GripVertical className="inline w-4 h-4" /> handle and drag items to reorder. Click <Eye className="inline w-4 h-4" /> to hide/show.
        </p>
      </div>

      {/* Drag and Drop List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-base font-semibold">Menu Order & Visibility</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <Droppable droppableId="navigation-items">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-3 p-4 rounded-xl transition-all duration-300 ${
                  snapshot.isDraggingOver 
                    ? 'bg-blue-50 border-2 border-blue-400 shadow-inner' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
                style={{ minHeight: '400px' }}
              >
                {localOrder.map((itemTitle, index) => {
                  const navItem = getNavItem(itemTitle);
                  const isHidden = localHidden.includes(itemTitle);
                  const visitCount = getVisitCount(itemTitle);
                  const Icon = navItem.icon;

                  return (
                    <Draggable key={itemTitle} draggableId={itemTitle} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 bg-white rounded-xl border-2 transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'border-blue-500 shadow-2xl scale-105 z-50 rotate-2'
                              : isHidden
                              ? 'border-gray-200 opacity-60'
                              : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            cursor: snapshot.isDragging ? 'grabbing' : 'default',
                          }}
                        >
                          {/* Drag Handle - Full Height Clickable Area */}
                          <div 
                            {...provided.dragHandleProps}
                            className={`flex items-center justify-center w-12 h-full py-4 border-r-2 rounded-l-xl transition-colors ${
                              snapshot.isDragging 
                                ? 'bg-blue-100 border-blue-300 cursor-grabbing' 
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-grab active:cursor-grabbing'
                            }`}
                          >
                            <GripVertical className={`w-6 h-6 ${snapshot.isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
                          </div>

                          {/* Content Area */}
                          <div className="flex items-center gap-3 flex-1 py-3 pr-3">
                            {Icon && (
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${navItem.gradient} flex-shrink-0 shadow-sm`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate text-base">
                                {navItem.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                {visitCount > 0 ? (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Visited {visitCount} {visitCount === 1 ? 'time' : 'times'}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                                    Not visited yet
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Position Badge and Visibility Toggle */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md min-w-[36px] text-center">
                                #{index + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleItemVisibility(itemTitle)}
                                className={`h-9 w-9 rounded-lg transition-colors ${
                                  isHidden 
                                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' 
                                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                                }`}
                              >
                                {isHidden ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {localHidden.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg"
          >
            <p className="text-sm text-yellow-800">
              <strong>🙈 {localHidden.length}</strong> menu {localHidden.length === 1 ? 'item is' : 'items are'} currently hidden
            </p>
          </motion.div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all px-6"
          size="lg"
        >
          Save & Close
        </Button>
      </div>
    </div>
  );
}
