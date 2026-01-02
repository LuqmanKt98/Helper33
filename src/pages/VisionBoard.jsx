import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VisionCardCreator from '@/components/vision_board/VisionCardCreator';
import VisionCardDisplay from '@/components/vision_board/VisionCardDisplay';
import { Plus, LayoutGrid, Trash2, Shield, GalleryVerticalEnd, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

function VisionBoardContent() {
  const queryClient = useQueryClient();
  const [showBoardCreator, setShowBoardCreator] = useState(false);
  const [showCardCreator, setShowCardCreator] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: boards = [], isLoading: isLoadingBoards } = useQuery({
    queryKey: ['visionBoards'],
    queryFn: () => base44.entities.VisionBoard.list(),
    initialData: []
  });

  const { data: cards = [], isLoading: isLoadingCards } = useQuery({
    queryKey: ['visionCards', selectedBoardId],
    queryFn: () => base44.entities.VisionCard.filter({ board_id: selectedBoardId }),
    enabled: !!selectedBoardId,
    initialData: []
  });

  const createBoardMutation = useMutation({
    mutationFn: (boardData) => base44.entities.VisionBoard.create(boardData),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['visionBoards'] });
      setShowBoardCreator(false);
      setSelectedBoardId(newBoard.id);
      setNewBoard({ title: '', description: '' });
    },
  });
  
  const deleteBoardMutation = useMutation({
    mutationFn: (boardId) => base44.entities.VisionBoard.delete(boardId),
    onSuccess: (_, deletedBoardId) => {
      queryClient.invalidateQueries({ queryKey: ['visionBoards'] });
      if (selectedBoardId === deletedBoardId) {
        setSelectedBoardId(null); 
      }
    },
  });

  const handleCreateBoard = () => {
    if (!newBoard.title.trim()) {
        alert("Board title cannot be empty.");
        return;
    }
    createBoardMutation.mutate(newBoard);
  };
  
  const handleDeleteBoard = (boardId) => {
    if (window.confirm('Are you sure you want to delete this entire board and all its cards? This action cannot be undone.')) {
      deleteBoardMutation.mutate(boardId);
    }
  };

  useEffect(() => {
    if (!selectedBoardId && boards && boards.length > 0) {
      setSelectedBoardId(boards[0].id);
    } 
    else if (selectedBoardId && boards && !boards.some(board => board.id === selectedBoardId)) {
        setSelectedBoardId(boards.length > 0 ? boards[0].id : null);
    }
    else if (!selectedBoardId && boards && boards.length === 0) {
        setSelectedBoardId(null);
    }
  }, [boards, selectedBoardId]);

  const currentBoard = boards.find(b => b.id === selectedBoardId);

  return (
    <div className="flex flex-col md:flex-row md:h-screen bg-gray-50/50 md:overflow-hidden">
      <aside className="w-full md:w-80 flex-shrink-0 bg-white border-r md:overflow-y-auto p-6 md:pb-20">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-3xl font-bold text-gray-800 tracking-tight">My Vision Boards</h1>
          <p className="text-sm text-gray-600 mt-2">Visualize your dreams, then build the path to achieve them.</p>
        </header>

        <div className="mb-6">
          <Button 
            onClick={() => setShowBoardCreator(true)} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 touch-manipulation min-h-[44px]"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Board
          </Button>
        </div>

        {isLoadingBoards ? (
          <p className="text-gray-500">Loading boards...</p>
        ) : boards.length > 0 ? (
          <div className="space-y-4">
            {boards.map(board => (
              <motion.div key={board.id} whileHover={{ x: 5 }}>
                <Card 
                  className={`w-full cursor-pointer transition-all duration-300 ${selectedBoardId === board.id ? 'border-indigo-500 border-2 shadow-lg' : 'hover:shadow-md'}`}
                  onClick={() => setSelectedBoardId(board.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="flex justify-between items-start text-base">
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5" style={{ color: board.themeColor || '#7C3AED' }} /> {board.title}
                      </span>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500 touch-manipulation" onClick={(e) => { e.stopPropagation(); handleDeleteBoard(board.id); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs mt-1">
                        <Shield className="w-3 h-3" /> {board.visibility}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
             <div className="text-center py-8 px-2 bg-gray-50 rounded-xl border border-dashed mt-8">
                <h3 className="text-md font-semibold text-gray-800">No boards yet!</h3>
                <p className="text-gray-500 text-sm mt-2 mb-4">Click "Create New Board" to get started.</p>
            </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex-shrink-0 p-4 border-b bg-white flex justify-between items-center shadow-sm">
            {selectedBoardId ? (
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <GalleryVerticalEnd className="w-6 h-6 text-indigo-600" />
                    {currentBoard?.title}
                </h2>
            ) : (
                <h2 className="text-2xl font-bold text-gray-800">Select a Vision Board</h2>
            )}
            
            <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setShowCardCreator(true)} 
                  disabled={!selectedBoardId}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 touch-manipulation min-h-[44px]"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Vision Card
                </Button>
            </div>
        </header>

        <div className="flex-1 md:overflow-y-auto p-6">
          {isLoadingCards ? (
            <p className="text-center text-gray-500 mt-10">Loading cards...</p>
          ) : (
            selectedBoardId ? (
                cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {cards.map(card => (
                            <VisionCardDisplay key={card.id} card={card} themeColor={currentBoard?.themeColor} />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-12 bg-gray-100/80 rounded-2xl border-2 border-dashed">
                            <ClipboardCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700">This board is your canvas.</h3>
                            <p className="text-gray-500 mb-6">What's the first dream you want to bring to life?</p>
                            <Button 
                              onClick={() => setShowCardCreator(true)} 
                              variant="default" 
                              size="lg"
                              className="touch-manipulation min-h-[44px]"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Create Your First Vision Card
                            </Button>
                        </div>
                    </div>
                )
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center p-12 bg-gray-100/80 rounded-2xl border-2 border-dashed">
                        <GalleryVerticalEnd className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No board selected.</h3>
                        <p className="text-gray-500 mb-6">Choose a board from the left sidebar, or create a new one to begin.</p>
                        <Button 
                          onClick={() => setShowBoardCreator(true)} 
                          variant="default" 
                          size="lg"
                          className="touch-manipulation min-h-[44px]"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Board
                        </Button>
                    </div>
                </div>
            )
          )}
        </div>
      </main>

      <Dialog open={showBoardCreator} onOpenChange={setShowBoardCreator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Vision Board</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex-col space-y-4 py-4">
            <Input 
                placeholder="Board Title (e.g., 'Career Goals 2025')" 
                value={newBoard.title} 
                onChange={e => setNewBoard({...newBoard, title: e.target.value})}
                className="min-h-[44px]"
            />
            <Textarea 
                placeholder="Description (optional)" 
                value={newBoard.description} 
                onChange={e => setNewBoard({...newBoard, description: e.target.value})}
                className="min-h-[80px]"
            />
            <Button 
              onClick={handleCreateBoard} 
              className="w-full touch-manipulation min-h-[44px]" 
              disabled={createBoardMutation.isPending || !newBoard.title.trim()}
            >
              {createBoardMutation.isPending ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedBoardId && (
          <VisionCardCreator 
              isOpen={showCardCreator}
              onClose={() => setShowCardCreator(false)}
              boardId={selectedBoardId}
              aiAffirmationsEnabled={true}
              onCardCreated={() => queryClient.invalidateQueries({ queryKey: ['visionCards', selectedBoardId] })}
          />
      )}
    </div>
  );
}

export default function VisionBoard() {
  return (
    <>
      <SEO 
        title="Vision Board - DobryLife | Visualize Your Goals & Dreams"
        description="Create digital vision boards to visualize your goals, dreams, and aspirations. Use images, affirmations, and micro-actions to manifest your ideal life."
        keywords="vision board, goal visualization, manifestation, dream board, visual goal setting, life goals, digital vision board, goal planning"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <VisionBoardContent />
      </div>
    </>
  );
}