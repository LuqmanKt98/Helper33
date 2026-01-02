import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, ExternalLink, AlertCircle, MapPin } from 'lucide-react';

export default function LocalResourceFinder() {
    const [zipCode, setZipCode] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!zipCode || !resourceType) {
            setError('Please enter a zip code and select a resource type.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setResults([]);

        try {
            const response = await base44.functions.invoke('findLocalResources', { zipCode, resourceType });
            if (response.data.results && response.data.results.length > 0) {
                setResults(response.data.results);
            } else {
                setError('No specific search suggestions found. Please try a different search.');
            }
        } catch (err) {
            console.error("Error finding local resources:", err);
            setError('Failed to fetch resources. The server might be busy, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Find Local Support & Resources
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 mb-4">
                    Enter your zip code to find reporting agencies, support groups, and professionals in your area.
                </p>
                <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-4 mb-6">
                    <Input
                        type="text"
                        placeholder="Enter Zip Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        pattern="[0-9]{5}"
                        title="Enter a 5-digit US zip code"
                        required
                        className="md:col-span-1"
                    />
                    <Select value={resourceType} onValueChange={setResourceType} required>
                        <SelectTrigger className="md:col-span-1">
                            <SelectValue placeholder="Select Resource Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lawyer">Lawyer / Legal</SelectItem>
                            <SelectItem value="funeral_home">Funeral Home</SelectItem>
                            <SelectItem value="financial_advisor">Financial Advisor</SelectItem>
                            <SelectItem value="therapist">Grief Counselor / Therapist</SelectItem>
                            <SelectItem value="legal_aid">Legal Aid</SelectItem>
                            <SelectItem value="consumer_protection">Consumer Protection</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" disabled={isLoading} className="md:col-span-1 bg-blue-600 hover:bg-blue-700">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4 mr-2" />
                        )}
                        Find Resources
                    </Button>
                </form>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {results.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-semibold">Your Personalized Resource Links:</h4>
                        {results.map((result, index) => (
                            <a 
                                key={index} 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border transition-colors group"
                            >
                                <div>
                                    <strong className="text-gray-800">{result.title}</strong>
                                    <p className="text-xs text-gray-600">{result.description}</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                            </a>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}