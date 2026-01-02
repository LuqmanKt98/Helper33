
import React, { useState, useEffect, useMemo } from 'react';
import { FavoriteItem } from '@/entities/FavoriteItem';
import { FavoriteCollection } from '@/entities/FavoriteCollection';
import { NewsUpdate } from '@/entities/NewsUpdate';
import { InfluencerProject } from '@/entities/InfluencerProject';
import { User } from '@/entities/User';
import { Loader2, Bookmark, Newspaper, Palette, Trash2, Edit, Check, X, Folder } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

const CollectionHeader = ({ collection, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(collection.name);

  useEffect(() => {
    setName(collection.name); // Keep local state in sync with prop for when collection name changes externally
  }, [collection.name]);

  const handleUpdate = () => {
    if (name.trim() === collection.name) {
        setIsEditing(false);
        return;
    }
    onUpdate(collection.id, name.trim());
    setIsEditing(false);
  }

  return (
    <div className="flex items-center gap-2 mb-4">
        {isEditing ? (
            <>
                <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="text-2xl font-bold h-auto p-0 border-b-2 border-primary focus-visible:ring-0 focus-visible:ring-offset-0" 
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                />
                <Button size="icon" variant="ghost" onClick={handleUpdate}><Check className="w-5 h-5 text-green-600"/></Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}><X className="w-5 h-5 text-red-600"/></Button>
            </>
        ) : (
            <>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    {collection.id === 'uncategorized' ? <Bookmark className="w-6 h-6 text-orange-600" /> : <Folder className="w-6 h-6 text-orange-600" />}
                    {collection.name}
                </h2>
                {collection.id !== 'uncategorized' && (
                    <>
                        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 text-gray-500"/></Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="icon" variant="ghost"><Trash2 className="w-4 h-4 text-red-500"/></Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Collection</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete the "{collection.name}" collection? All items within it will become uncategorized. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogTrigger asChild><Button variant="outline">Cancel</Button></DialogTrigger>
                                    <Button variant="destructive" onClick={() => onDelete(collection.id)}>Delete</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </>
        )}
    </div>
  )
}


export default function MyFavorites() {
  const [collections, setCollections] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [contentItems, setContentItems] = useState(new Map()); // Map of item_id to actual NewsUpdate/InfluencerProject object
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const [favCollections, favItems] = await Promise.all([
          FavoriteCollection.list(),
          FavoriteItem.filter({ created_by: user.email })
      ]);

      const newsIds = favItems.filter(f => f.item_type === 'news').map(f => f.item_id);
      const projectIds = favItems.filter(f => f.item_type === 'project').map(f => f.item_id);
      
      const [newsData, projectData] = await Promise.all([
        newsIds.length > 0 ? NewsUpdate.filter({ id: { "$in": newsIds } }) : Promise.resolve([]),
        projectIds.length > 0 ? InfluencerProject.filter({ id: { "$in": projectIds } }) : Promise.resolve([])
      ]);
      
      const allContent = [...newsData, ...projectData];
      const contentMap = new Map(allContent.map(item => [item.id, item]));

      setCollections(favCollections);
      setFavoriteItems(favItems);
      setContentItems(contentMap);

    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleRemoveFavorite = async (itemId) => {
    try {
        const fav = favoriteItems.find(f => f.item_id === itemId);
        if (fav) {
            await FavoriteItem.delete(fav.id);
            fetchData(); // Refetch data to update the UI
        }
    } catch (error) {
        console.error("Failed to remove favorite:", error);
    }
  };

  const handleUpdateCollection = async (collectionId, newName) => {
      try {
          await FavoriteCollection.update(collectionId, { name: newName });
          fetchData();
      } catch (error) {
          console.error("Failed to update collection:", error);
      }
  }

  const handleDeleteCollection = async (collectionId) => {
      try {
        // Find all favorites in this collection and move them to uncategorized
        const itemsToUpdate = favoriteItems.filter(fav => fav.collection_id === collectionId);
        for(const item of itemsToUpdate) {
            await FavoriteItem.update(item.id, { collection_id: null });
        }
        // Then delete the collection
        await FavoriteCollection.delete(collectionId);
        fetchData();
      } catch (error) {
          console.error("Failed to delete collection:", error);
      }
  }

  const groupedFavorites = useMemo(() => {
    const groups = new Map();
    // Add an 'uncategorized' group by default
    groups.set('uncategorized', {
        id: 'uncategorized',
        name: 'Uncategorized',
        items: []
    });

    // Add all existing collections to the groups map
    collections.forEach(col => {
        groups.set(col.id, { ...col, items: [] });
    });

    // Populate groups with favorite items
    favoriteItems.forEach(fav => {
        const content = contentItems.get(fav.item_id);
        if (content) {
            const groupKey = fav.collection_id || 'uncategorized';
            if (groups.has(groupKey)) {
                // Add item with its type (news/project) for proper rendering
                groups.get(groupKey).items.push({ ...content, fav_type: fav.item_type });
            }
        }
    });

    // Filter out groups that have no items, except 'uncategorized' if it's the only one
    // and sort collections by name, 'uncategorized' always first if it has items.
    const result = Array.from(groups.values()).filter(g => g.items.length > 0);
    
    result.sort((a, b) => {
      if (a.id === 'uncategorized') return -1;
      if (b.id === 'uncategorized') return 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [collections, favoriteItems, contentItems]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (favoriteItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold">No Favorites Yet</h3>
        <p>Click the bookmark icon on news or projects to save them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedFavorites.map(group => (
        <section key={group.id}>
          <CollectionHeader collection={group} onUpdate={handleUpdateCollection} onDelete={handleDeleteCollection} />
          
          <div className="space-y-4">
            {group.items.map(item => (
              <motion.div key={`${item.id}-${item.fav_type}`} layout>
                <Card className="p-4 flex flex-col md:flex-row gap-4 items-start">
                   <div className="flex-grow">
                     <div className="flex items-center gap-2 mb-2">
                        {item.fav_type === 'news' ? 
                            <Newspaper className="w-5 h-5 text-gray-500" /> : 
                            <Palette className="w-5 h-5 text-gray-500" />
                        }
                        <h3 className="text-lg font-bold text-gray-800">{item.title || item.project_title}</h3>
                     </div>
                     <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.summary || item.project_description}</p>
                     <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                            <a href={item.link || item.project_link} target="_blank" rel="noopener noreferrer">View Item</a>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => handleRemoveFavorite(item.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                        </Button>
                     </div>
                   </div>
                   { (item.image_url || item.project_image_url) && 
                      <img 
                        src={item.image_url || item.project_image_url} 
                        alt={item.title || item.project_title} 
                        className="w-full md:w-32 h-auto object-cover rounded-lg flex-shrink-0" 
                      />
                   }
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
