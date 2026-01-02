import React, { useState, useEffect } from 'react';
import { FavoriteCollection } from '@/entities/FavoriteCollection';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Bookmark, FolderPlus } from 'lucide-react';

export default function AddToFavoritesModal({ isOpen, onClose, item, itemType, onSave, onRemove, existingFavorite }) {
    const [collections, setCollections] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [showNewCollection, setShowNewCollection] = useState(false);

    useEffect(() => {
        if (isOpen) {
            async function fetchCollections() {
                const userCollections = await FavoriteCollection.list();
                setCollections(userCollections);
                if (existingFavorite) {
                    setSelectedCollectionId(existingFavorite.collection_id || 'uncategorized');
                } else {
                    setSelectedCollectionId('uncategorized');
                }
            }
            fetchCollections();
            setShowNewCollection(false);
            setNewCollectionName('');
        }
    }, [isOpen, existingFavorite]);

    const handleSave = async () => {
        let collectionId = selectedCollectionId;
        if (showNewCollection && newCollectionName) {
            const newCollection = await FavoriteCollection.create({ name: newCollectionName });
            collectionId = newCollection.id;
        } else if (selectedCollectionId === 'uncategorized') {
            collectionId = null;
        }
        
        onSave(item, itemType, collectionId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-orange-500" />
                        Save to Collection
                    </DialogTitle>
                    <DialogDescription>
                        Organize your saved items by adding them to a collection.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!showNewCollection ? (
                         <Select onValueChange={setSelectedCollectionId} value={selectedCollectionId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a collection" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                                {collections.map(col => (
                                    <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input 
                            placeholder="New collection name..."
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                        />
                    )}
                   
                    <Button variant="outline" size="sm" onClick={() => setShowNewCollection(!showNewCollection)}>
                         {showNewCollection ? 'Cancel' : <><FolderPlus className="w-4 h-4 mr-2" /> Create New Collection</>}
                    </Button>
                </div>

                <DialogFooter>
                    {existingFavorite && (
                        <Button variant="destructive" onClick={() => onRemove(existingFavorite.id)}>Remove from Favorites</Button>
                    )}
                    <Button onClick={handleSave}>
                        {existingFavorite ? 'Update Collection' : 'Save to Favorites'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}