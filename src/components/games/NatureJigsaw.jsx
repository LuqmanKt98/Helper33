import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Award, Repeat, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const scenes = [
  { id: 1, url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Lush Forest' },
  { id: 2, url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Misty Sunrise' },
  { id: 3, url: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Sunlit Woods' },
  { id: 4, url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Mountain Valley' },
  { id: 5, url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Golden Sunset Beach' },
  { id: 6, url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Green Hills' },
  { id: 7, url: 'https://images.unsplash.com/photo-1546146477-15a587c927f7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Aurora Borealis' },
  { id: 8, url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Majestic Waterfall' },
  { id: 9, url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Misty Mountains' },
  { id: 10, url: 'https://images.unsplash.com/photo-1507525428034-b723a996f6ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80', name: 'Tropical Beach' },
];

const PUZZLE_DIMENSION = 3;

const NatureJigsaw = () => {
  const [pieces, setPieces] = useState([]);
  const [solved, setSolved] = useState(false);
  const [currentScene, setCurrentScene] = useState(scenes[0]);

  const shuffle = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const initializePuzzle = useCallback(() => {
    const newPieces = Array.from({ length: PUZZLE_DIMENSION * PUZZLE_DIMENSION }, (_, i) => ({
      id: `piece-${currentScene.id}-${i}`,
      correctIndex: i,
    }));
    setPieces(shuffle(newPieces));
    setSolved(false);
  }, [currentScene]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  const changeScene = () => {
    let newScene;
    do {
      newScene = scenes[Math.floor(Math.random() * scenes.length)];
    } while (newScene.id === currentScene.id);
    setCurrentScene(newScene);
  };

  const checkSolution = (currentPieces) => {
    if (currentPieces.every((piece, index) => piece.correctIndex === index)) {
      setSolved(true);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const newPieces = Array.from(pieces);
    const [reorderedItem] = newPieces.splice(result.source.index, 1);
    newPieces.splice(result.destination.index, 0, reorderedItem);

    setPieces(newPieces);
    checkSolution(newPieces);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <AnimatePresence>
        {solved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Award className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Wonderful!</h2>
            <p className="text-gray-600 mb-4">You've completed the {currentScene.name} puzzle.</p>
            <div className="flex gap-4">
              <Button onClick={initializePuzzle}>
                <Repeat className="w-4 h-4 mr-2" /> Play Again
              </Button>
              <Button onClick={changeScene} variant="secondary">
                <ImageIcon className="w-4 h-4 mr-2" /> Change Scene
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{currentScene.name} Jigsaw</h3>
            <p className="text-gray-600 mb-6">Arrange the pieces to reveal the beautiful scene.</p>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="puzzle">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-3 gap-1 w-80 h-80 bg-gray-200 rounded-lg p-1 shadow-inner"
                  >
                    {pieces.map((piece, index) => (
                      <Draggable key={piece.id} draggableId={piece.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`w-full h-full bg-cover bg-no-repeat rounded cursor-grab ${
                              snapshot.isDragging ? 'cursor-grabbing shadow-lg z-10' : ''
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              backgroundImage: `url(${currentScene.url})`,
                              backgroundSize: `${PUZZLE_DIMENSION * 100}% ${PUZZLE_DIMENSION * 100}%`,
                              backgroundPosition: `${(piece.correctIndex % PUZZLE_DIMENSION) * 100 / (PUZZLE_DIMENSION - 1)}% ${(Math.floor(piece.correctIndex / PUZZLE_DIMENSION)) * 100 / (PUZZLE_DIMENSION - 1)}%`,
                            }}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="flex gap-4 mt-6">
                <Button onClick={initializePuzzle} variant="outline">
                    <Repeat className="w-4 h-4 mr-2" /> Reset Puzzle
                </Button>
                <Button onClick={changeScene} variant="outline">
                    <ImageIcon className="w-4 h-4 mr-2" /> Change Puzzle
                </Button>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NatureJigsaw;