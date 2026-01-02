import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { GripVertical, Eye, EyeOff, RotateCcw, Sparkles } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/components/SoundManager";

export default function DashboardCustomizer({ 
  tabs, 
  currentOrder, 
  hiddenTabs = [], 
  onOrderChange, 
  onVisibilityChange,
  onReset,
  featureUsage = {}
}) {
  const { playSound } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [localOrder, setLocalOrder] = useState(currentOrder);
  const [localHidden, setLocalHidden] = useState(hiddenTabs);
  const [autoSortEnabled, setAutoSortEnabled] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    playSound('click');
    const items = Array.from(localOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setLocalOrder(items);
  };

  const toggleTabVisibility = (tabId) => {
    playSound('pop');
    if (localHidden.includes(tabId)) {
      setLocalHidden(localHidden.filter(id => id !== tabId));
    } else {
      setLocalHidden([...localHidden, tabId]);
    }
  };

  const handleSave = () => {
    playSound('success');
    onOrderChange(localOrder);
    onVisibilityChange(localHidden);
    setIsOpen(false);
  };

  const handleReset = () => {
    playSound('click');
    onReset();
    setLocalOrder(currentOrder);
    setLocalHidden([]);
    setAutoSortEnabled(false);
  };

  const sortByUsage = () => {
    playSound('success');
    const sorted = [...localOrder].sort((a, b) => {
      const usageA = featureUsage[a] || 0;
      const usageB = featureUsage[b] || 0;
      return usageB - usageA;
    });
    setLocalOrder(sorted);
    setAutoSortEnabled(true);
  };

  const getTabInfo = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab || { id: tabId, title: tabId, icon: null };
  };

  const getUsageCount = (tabId) => {
    return featureUsage[tabId] || 0;
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          playSound('click');
          setIsOpen(true);
        }}
        className="gap-2"
      >
        <GripVertical className="w-4 h-4" />
        Customize Dashboard
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GripVertical className="w-5 h-5" />
              Customize Your Dashboard
            </DialogTitle>
            <DialogDescription>
              Drag to reorder tabs, toggle visibility, or auto-sort by usage. Your changes will be saved automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {/* Auto-Sort Section */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Smart Auto-Sort</h4>
                      <p className="text-sm text-purple-700">
                        Automatically organize tabs based on your most-used features
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={sortByUsage}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Sort Now
                  </Button>
                </div>
                {autoSortEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 p-2 bg-white/60 rounded text-sm text-purple-800"
                  >
                    ✓ Tabs sorted by usage! Drag to manually adjust anytime.
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Drag and Drop List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Tab Order & Visibility</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="gap-2 text-gray-600 hover:text-gray-900"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </Button>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="dashboard-tabs">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-2 p-3 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <AnimatePresence>
                        {localOrder.map((tabId, index) => {
                          const tabInfo = getTabInfo(tabId);
                          const isHidden = localHidden.includes(tabId);
                          const usageCount = getUsageCount(tabId);
                          const Icon = tabInfo.icon;

                          return (
                            <Draggable key={tabId} draggableId={tabId} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, x: -100 }}
                                  className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition-all ${
                                    snapshot.isDragging
                                      ? 'border-blue-400 shadow-lg scale-105'
                                      : isHidden
                                      ? 'border-gray-200 opacity-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                  </div>

                                  {Icon && (
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${tabInfo.gradient || 'from-gray-400 to-gray-600'}`}>
                                      <Icon className="w-4 h-4 text-white" />
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                      {tabInfo.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {usageCount > 0 ? `Used ${usageCount} times` : 'Not used yet'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-500">
                                      #{index + 1}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleTabVisibility(tabId)}
                                      className={isHidden ? 'text-gray-400' : 'text-blue-600'}
                                    >
                                      {isHidden ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          );
                        })}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {localHidden.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
                >
                  <strong>{localHidden.length}</strong> {localHidden.length === 1 ? 'tab is' : 'tabs are'} hidden
                </motion.div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}