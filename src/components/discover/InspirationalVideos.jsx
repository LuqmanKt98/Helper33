import React, { useState, useEffect } from 'react';
import { InspirationalVideo } from '@/entities/InspirationalVideo';
import { FavoriteItem } from '@/entities/FavoriteItem';
import { User } from '@/entities/User';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Play, Clock, Bookmark, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToFavoritesModal from './AddToFavoritesModal';

const categoryColors = {
    motivation: 'bg-orange-100 text-orange-800 border-orange-200',
    mindfulness: 'bg-purple-100 text-purple-800 border-purple-200',
    grief_support: 'bg-rose-100 text-rose-800 border-rose-200',
    personal_growth: 'bg-blue-100 text-blue-800 border-blue-200',
    wellness: 'bg-green-100 text-green-800 border-green-200',
    gratitude: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    creativity: 'bg-pink-100 text-pink-800 border-pink-200',
    family: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const categoryIcons = {
    motivation: '🚀',
    mindfulness: '🧘',
    grief_support: '💝',
    personal_growth: '🌱',
    wellness: '💚',
    gratitude: '🙏',
    creativity: '🎨',
    family: '👨‍👩‍👧‍👦',
};

export default function InspirationalVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const currentUser = await User.me().catch(() => null);
            setUser(currentUser);

            const videoData = await InspirationalVideo.list('-created_date', 50);
            setVideos(videoData);

            if (currentUser) {
                const userFavorites = await FavoriteItem.filter({ 
                    item_type: "video", 
                    created_by: currentUser.email 
                });
                setFavorites(userFavorites);
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayVideo = (video) => {
        setSelectedVideo(video);
        setShowVideoModal(true);
    };

    const openFavoritesModal = (video) => {
        if (!user) {
            alert("Please log in to save favorites.");
            return;
        }
        setSelectedVideo(video);
        setShowFavoritesModal(true);
    };

    const handleSaveFavorite = async (item, itemType, collectionId) => {
        const existingFavorite = favorites.find(f => f.item_id === item.id);
        
        try {
            if (existingFavorite) {
                await FavoriteItem.update(existingFavorite.id, { collection_id: collectionId });
            } else {
                await FavoriteItem.create({
                    item_id: item.id,
                    item_type: itemType,
                    item_title: item.title,
                    created_by: user.email,
                    collection_id: collectionId,
                });
            }
            await fetchData();
            setShowFavoritesModal(false);
        } catch (error) {
            console.error('Failed to save favorite:', error);
            alert('Failed to save favorite. Please try again.');
        }
    };

    const handleRemoveFavorite = async (favoriteId) => {
        try {
            await FavoriteItem.delete(favoriteId);
            await fetchData();
            setShowFavoritesModal(false);
        } catch (error) {
            console.error('Failed to remove favorite:', error);
            alert('Failed to remove favorite. Please try again.');
        }
    };

    const favoriteIds = new Set(favorites.map(f => f.item_id));

    const categories = ['all', ...new Set(videos.map(v => v.category))];
    const filteredVideos = activeCategory === 'all' 
        ? videos 
        : videos.filter(v => v.category === activeCategory);

    const featuredVideos = videos.filter(v => v.is_featured);

    const getVideoEmbedUrl = (url) => {
        if (!url) return null;
        
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('youtu.be') 
                ? url.split('youtu.be/')[1]?.split('?')[0]
                : url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        // Vimeo
        if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        
        return url;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Featured Videos Section */}
            {featuredVideos.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg">
                            <Star className="w-5 h-5 fill-white" />
                            <span className="text-sm font-bold">FEATURED INSPIRATION</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredVideos.slice(0, 3).map((video, index) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                index={index}
                                onPlay={handlePlayVideo}
                                onFavorite={openFavoritesModal}
                                isFavorited={favoriteIds.has(video.id)}
                                isFeatured={true}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-6 overflow-x-auto justify-start">
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category} className="text-xs flex items-center gap-1">
                            {category !== 'all' && categoryIcons[category]}
                            {category === 'all' ? 'All Videos' : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeCategory}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredVideos.map((video, index) => (
                                <VideoCard
                                    key={video.id}
                                    video={video}
                                    index={index}
                                    onPlay={handlePlayVideo}
                                    onFavorite={openFavoritesModal}
                                    isFavorited={favoriteIds.has(video.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Video Player Modal */}
            {showVideoModal && selectedVideo && (
                <div 
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowVideoModal(false)}
                >
                    <div 
                        className="max-w-5xl w-full bg-white rounded-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="aspect-video">
                            <iframe
                                src={getVideoEmbedUrl(selectedVideo.video_url)}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedVideo.title}</h3>
                                    {selectedVideo.speaker_name && (
                                        <p className="text-gray-600">by {selectedVideo.speaker_name}</p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openFavoritesModal(selectedVideo)}
                                    className="text-gray-400 hover:text-orange-500"
                                >
                                    <Bookmark className={`w-5 h-5 ${favoriteIds.has(selectedVideo.id) ? 'fill-orange-500 text-orange-500' : ''}`} />
                                </Button>
                            </div>
                            <p className="text-gray-700 mb-4">{selectedVideo.description}</p>
                            <div className="flex gap-2">
                                <Badge className={categoryColors[selectedVideo.category]}>
                                    {categoryIcons[selectedVideo.category]} {selectedVideo.category.replace(/_/g, ' ')}
                                </Badge>
                                {selectedVideo.duration && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {selectedVideo.duration}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end">
                            <Button onClick={() => setShowVideoModal(false)} variant="outline">Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Favorites Modal */}
            {selectedVideo && (
                <AddToFavoritesModal
                    isOpen={showFavoritesModal}
                    onClose={() => setShowFavoritesModal(false)}
                    item={selectedVideo}
                    itemType="video"
                    onSave={handleSaveFavorite}
                    onRemove={handleRemoveFavorite}
                    existingFavorite={favorites.find(f => f.item_id === selectedVideo.id)}
                />
            )}
        </div>
    );
}

function VideoCard({ video, index, onPlay, onFavorite, isFavorited, isFeatured = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-300 ${isFeatured ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' : ''}`}>
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    {video.thumbnail_url ? (
                        <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                            <Video className="w-16 h-16 text-gray-500" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                        <Button
                            onClick={() => onPlay(video)}
                            size="lg"
                            className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-16 h-16 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl"
                        >
                            <Play className="w-8 h-8 ml-1" fill="currentColor" />
                        </Button>
                    </div>
                    {isFeatured && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-yellow-500 text-white border-none">
                                <Star className="w-3 h-3 mr-1 fill-white" />
                                Featured
                            </Badge>
                        </div>
                    )}
                    {video.duration && (
                        <div className="absolute bottom-2 right-2">
                            <Badge className="bg-black/70 text-white border-none">
                                {video.duration}
                            </Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-800 line-clamp-2 flex-1">{video.title}</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onFavorite(video)}
                            className="text-gray-400 hover:text-orange-500 flex-shrink-0"
                        >
                            <Bookmark className={`w-5 h-5 transition-all ${isFavorited ? 'fill-orange-500 text-orange-500' : ''}`} />
                        </Button>
                    </div>
                    {video.speaker_name && (
                        <p className="text-sm text-gray-600 mb-2">by {video.speaker_name}</p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{video.description}</p>
                    <Badge className={categoryColors[video.category]}>
                        {categoryIcons[video.category]} {video.category.replace(/_/g, ' ')}
                    </Badge>
                </CardContent>
            </Card>
        </motion.div>
    );
}