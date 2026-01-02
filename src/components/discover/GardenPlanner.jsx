import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Sun, Leaf, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const beginnerHerbs = [
    { name: 'Basil', tip: 'Loves sun and warmth. Great for pesto and pasta!', icon: '🌿' },
    { name: 'Mint', tip: 'Grows very fast! Keep it in its own pot to prevent it from taking over.', icon: '🍃' },
    { name: 'Parsley', tip: 'A versatile herb that enjoys morning sun. Keep cutting to encourage growth.', icon: '🌱' },
    { name: 'Chives', tip: 'Easy to grow and has a mild onion flavor. The flowers are edible too!', icon: '🌸' },
    { name: 'Rosemary', tip: 'Needs lots of sun and well-drained soil. Smells amazing!', icon: '🌳' },
];

const beginnerGreens = [
    { name: 'Leaf Lettuce', tip: 'Harvest outer leaves first, and it will keep producing for weeks.', icon: '🥬' },
    { name: 'Spinach', tip: 'Prefers cooler weather. Plant in spring or fall for best results.', icon: '🥗' },
    { name: 'Arugula', tip: 'A spicy green that grows quickly. Perfect for salads.', icon: '🚀' },
    { name: 'Kale', tip: 'Very hardy and can be harvested multiple times. Great for smoothies.', icon: '💪' },
];

export default function GardenPlanner() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-0 shadow-lg overflow-hidden">
                <CardHeader className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
                            <Sprout className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-800">Your First Garden Planner</CardTitle>
                            <CardDescription className="text-gray-600">Grow your own fresh herbs and greens with these simple tips.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Sun className="w-5 h-5 text-yellow-500" /> Getting Started: Basic Tips</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-1">Sunlight</h4>
                        <p className="text-sm text-yellow-700">Find a spot that gets at least 6 hours of direct sunlight each day.</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-1">Water</h4>
                        <p className="text-sm text-blue-700">Water when the top inch of soil feels dry. Don't let them get too soggy.</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="font-semibold text-amber-800 mb-1">Soil</h4>
                        <p className="text-sm text-amber-700">Use a good quality potting mix from a garden center for best results.</p>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                        <h4 className="font-semibold text-stone-800 mb-1">Containers</h4>
                        <p className="text-sm text-stone-700">Make sure your pots have drainage holes at the bottom to prevent root rot.</p>
                    </div>
                </CardContent>
            </Card>
            
            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Leaf className="w-5 h-5 text-green-600" /> Easy Herbs to Grow</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {beginnerHerbs.map(herb => (
                            <div key={herb.name} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                                <span className="text-2xl">{herb.icon}</span>
                                <div>
                                    <h5 className="font-semibold text-gray-800">{herb.name}</h5>
                                    <p className="text-sm text-gray-600">{herb.tip}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Sprout className="w-5 h-5 text-lime-600" /> Simple Greens to Grow</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {beginnerGreens.map(green => (
                            <div key={green.name} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
                                <span className="text-2xl">{green.icon}</span>
                                <div>
                                    <h5 className="font-semibold text-gray-800">{green.name}</h5>
                                    <p className="text-sm text-gray-600">{green.tip}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
                 <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-lg">Ready to Plan?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">A fully interactive garden planner is coming soon. For now, use these ideas to start your journey!</p>
                    <Button onClick={() => alert('Interactive planner coming soon!')}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Your Garden Plan (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}