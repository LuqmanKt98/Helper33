
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, BookHeart, Sparkles, Search, Archive } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import MemoryCard from '@/components/memory/MemoryCard';
import MemoryDetail from '@/components/memory/MemoryDetail';
import MemoryForm from '@/components/memory/MemoryForm';
import { Input } from '@/components/ui/input';
// import SubscriptionGate from '@/components/SubscriptionGate'; // Removed old import
import { Card } from '@/components/ui/card';
import { FeatureGate } from '@/components/PlanChecker'; // New import
import SEO from '@/components/SEO';

const fetchMemories = async () => {
    return base44.entities.Memory.list('-created_date');
};

const ParticleEffect = () => {
    useEffect(() => {
        const container = document.getElementById('particle-container');
        if (!container) return;

        // Clean up existing particles to prevent duplicates on re-renders
        container.innerHTML = ''; 

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 3 + 1; // Size between 1px and 4px
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 20}s`; // Delay animation start
            particle.style.animationDuration = `${Math.random() * 15 + 10}s`; // Duration between 10s and 25s
            container.appendChild(particle);
        }

        // Define CSS for particles, typically this would be in a global CSS file
        // For self-containment in this example, a style tag could be dynamically added,
        // but for a production app, it should be in global.css or equivalent.
        // Assuming the following CSS is globally available:
        /*
        .particle {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: floatAndFade infinite ease-in-out;
            opacity: 0;
            transform: translateY(0);
        }
        @keyframes floatAndFade {
            0% {
                opacity: 0;
                transform: translateY(0);
                background-color: rgba(255, 255, 255, 0.6);
            }
            20% {
                opacity: 1;
            }
            80% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translateY(-100vh) translateX(calc(var(--rand-x, 0) * 10px));
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
        */

    }, []); // Empty dependency array means this effect runs once on mount
    return <div id="particle-container" className="absolute inset-0 pointer-events-none z-0"></div>;
};

const categories = ["All", "Family", "Personal", "Achievement", "Travel", "Milestone", "Funny Moment", "Other"];

function MemoryVaultContent() {
    const queryClient = useQueryClient();
    const [selectedMemory, setSelectedMemory] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const { data: memories = [], isLoading, error } = useQuery({
        queryKey: ['memories'],
        queryFn: fetchMemories
    });
    
    const filteredMemories = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        return memories
            .filter(memory => {
                if (activeCategory === 'All') return true;
                return memory.category === activeCategory;
            })
            .filter(memory => {
                if (!lowercasedQuery) return true;
                return (
                    memory.title?.toLowerCase().includes(lowercasedQuery) ||
                    memory.content?.toLowerCase().includes(lowercasedQuery) ||
                    memory.category?.toLowerCase().includes(lowercasedQuery) ||
                    memory.associated_person?.toLowerCase().includes(lowercasedQuery) ||
                    (memory.tags || []).some(tag => tag.toLowerCase().includes(lowercasedQuery)) ||
                    memory.ai_description?.toLowerCase().includes(lowercasedQuery)
                );
            });
    }, [memories, searchQuery, activeCategory]);

    const deleteMutation = useMutation({
        mutationFn: (memoryId) => base44.entities.Memory.delete(memoryId),
        onSuccess: () => {
            queryClient.invalidateQueries(['memories']);
            setSelectedMemory(null);
        }
    });

    const handleDeleteMemory = (memoryId) => {
        if (window.confirm("Are you sure you want to delete this memory forever?")) {
            deleteMutation.mutate(memoryId);
        }
    };

    // This function is defined but not used in the original MemoryVault.
    // Keeping it here for completeness, as it was part of the original code's scope.
    // const mediaTypeIcon = (type) => {
    //     switch (type) {
    //         case 'image': return <ImageIcon className="w-4 h-4 text-gray-500" />;
    //         case 'video': return <Video className="w-4 h-4 text-gray-500" />;
    //         case 'audio': return <Mic className="w-4 h-4 text-gray-500" />;
    //         default: return <FileText className="w-4 h-4 text-gray-500" />;
    //     }
    // };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
            </div>
        );
    }
    
    if (error) {
        return <div className="p-8 text-red-400 bg-slate-900 min-h-screen">Error loading memories: {error.message}</div>;
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
            <ParticleEffect />
            <div className="max-w-6xl mx-auto relative z-10">
                <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <Archive className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Memory Vault</h1>
                    </div>
                    <p className="text-gray-600 mb-8">
                        Preserve and cherish your most precious memories in your personal vault.
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                onClick={() => setIsCreating(true)}
                                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-800 font-bold shadow-lg hover:shadow-amber-500/30 transition-all duration-300 px-8 py-6 text-lg"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Weave a New Memory
                            </Button>
                        </motion.div>
                    </div>

                    {/* Search and Filter Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="mb-10 px-4"
                    >
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400"/>
                            <Input
                                type="text"
                                placeholder="Search memories by keyword, person, or visual details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 border-2 border-purple-200 rounded-full pl-12 pr-4 py-3 h-14 text-lg text-gray-800 focus:ring-purple-400 focus:border-purple-400 shadow-inner placeholder:text-gray-500"
                            />
                        </div>
                        <div className="flex justify-center flex-wrap gap-2 mt-6">
                            {categories.map(category => (
                                <motion.button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                                        activeCategory === category 
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-400/20' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {category}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>


                    {filteredMemories.length === 0 && !isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-gray-50 rounded-2xl shadow-inner border border-purple-100 backdrop-blur-sm text-gray-700"
                        >
                            <div className="inline-block p-5 bg-gradient-to-br from-purple-300/50 to-pink-300/50 rounded-full mb-6 ring-2 ring-purple-400/50">
                                <BookHeart className="w-12 h-12 text-purple-600"/>
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">{searchQuery || activeCategory !== 'All' ? 'No Memories Found' : 'Your Vault Awaits Its First Story'}</h2>
                            <p className="mt-2 text-gray-600">{searchQuery || activeCategory !== 'All' ? 'Try a different search or category.' : 'Begin by weaving your first precious memory into the fabric of time.'}</p>
                            <Button onClick={() => setIsCreating(true)} className="mt-6 bg-purple-600 text-white hover:bg-purple-700 font-semibold">Create a Memory</Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMemories.map((memory, index) => (
                                <motion.div
                                    key={memory.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    layout
                                >
                                    <MemoryCard 
                                        memory={memory} 
                                        onClick={() => setSelectedMemory(memory)} 
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <AnimatePresence>
                {selectedMemory && !isCreating && (
                    <MemoryDetail 
                        memory={selectedMemory} 
                        onClose={() => setSelectedMemory(null)}
                        onEdit={() => {
                            const memoryToEdit = selectedMemory;
                            setSelectedMemory(null);
                            setTimeout(() => {
                                setIsCreating(true);
                                setSelectedMemory(memoryToEdit);
                            }, 300);
                        }}
                        onDelete={handleDeleteMemory}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCreating && (
                    <MemoryForm
                        isOpen={isCreating}
                        onClose={() => {
                            setIsCreating(false);
                            setSelectedMemory(null); // Clear selected memory when closing form
                        }}
                        existingMemory={selectedMemory}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function MemoryVault() {
    return (
        <>
            <SEO 
                title="Memory Vault - DobryLife | Preserve & Share Precious Memories"
                description="Store, organize, and share your precious memories. Upload photos, videos, and voice recordings. Add AI descriptions and share with family members."
                keywords="memory vault, digital memories, photo storage, memory preservation, family memories, memory sharing, digital scrapbook, memory keeper"
            />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
                <FeatureGate
                    featureKey="memory_vault"
                    featureName="Memory Vault"
                    featureDescription="A private, sacred space to preserve and cherish your precious memories forever."
                >
                    <MemoryVaultContent />
                </FeatureGate>
            </div>
        </>
    );
}
