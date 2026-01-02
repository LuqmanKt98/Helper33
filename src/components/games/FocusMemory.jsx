import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Repeat, Award } from "lucide-react";
import { 
  Heart, 
  Leaf, 
  Sparkles, 
  Star, 
  Sun, 
  Wind, 
  Brain, 
  Droplets 
} from "lucide-react";

const icons = [Heart, Leaf, Sparkles, Star, Sun, Wind, Brain, Droplets];
const cardPairs = [...icons, ...icons];

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const FocusMemory = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const setupGame = () => {
    const shuffledCards = shuffleArray(cardPairs);
    setCards(shuffledCards.map((Icon, index) => ({ id: index, Icon, isFlipped: false })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsFinished(false);
  };

  useEffect(() => {
    setupGame();
  }, []);

  const handleFlip = (index) => {
    if (flipped.length === 2 || matched.includes(cards[index].Icon)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    const updatedCards = cards.map((card, i) => 
      i === index ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);
  };

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(moves + 1);
      const [firstIndex, secondIndex] = flipped;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];

      if (firstCard.Icon === secondCard.Icon) {
        setMatched([...matched, firstCard.Icon]);
        setFlipped([]);
      } else {
        setTimeout(() => {
          const updatedCards = cards.map((card, i) =>
            i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card
          );
          setCards(updatedCards);
          setFlipped([]);
        }, 1000);
      }
    }
  }, [flipped, cards, matched, moves]);

  useEffect(() => {
    if (matched.length === icons.length) {
      setIsFinished(true);
    }
  }, [matched]);

  return (
    <div className="flex flex-col items-center p-4">
      <AnimatePresence>
        {isFinished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Award className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Well Done!</h2>
            <p className="text-gray-600 mb-4">You completed the game in {moves} moves.</p>
            <Button onClick={setupGame}>
              <Repeat className="w-4 h-4 mr-2" /> Play Again
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between w-full max-w-sm mb-4">
              <div className="text-lg font-medium text-gray-700">Moves: {moves}</div>
              <div className="text-lg font-medium text-gray-700">
                Matched: {matched.length} / {icons.length}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  onClick={() => !card.isFlipped && handleFlip(index)}
                  className="w-20 h-20 rounded-lg cursor-pointer"
                  style={{ perspective: 1000 }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: card.isFlipped || matched.includes(card.Icon) ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Card Back */}
                    <div
                      className="absolute w-full h-full rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <Sparkles className="w-8 h-8 text-white/50" />
                    </div>
                    {/* Card Front */}
                    <div
                      className="absolute w-full h-full rounded-lg bg-white border-2 border-indigo-200 flex items-center justify-center"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <card.Icon className="w-10 h-10 text-indigo-600" />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusMemory;