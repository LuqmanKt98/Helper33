import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Archive, Download, ServerCrash } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

export default function ExportData() {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);

    const handleExport = async () => {
        setIsExporting(true);
        setError(null);

        try {
            const response = await base44.functions.invoke('exportAllData');
            
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dobrylife_export.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (err) {
            console.error("Export failed:", err);
            setError("The data export failed. Please try again or contact support.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <SEO 
                title="Export Your Data - DobryLife"
                description="Download a complete archive of all your DobryLife data"
            />
            
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    <Card className="shadow-2xl border-2 border-purple-200">
                        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Archive className="mx-auto h-12 w-12 mb-4" />
                            <CardTitle className="text-2xl font-bold">Export Your Data</CardTitle>
                            <CardDescription className="text-purple-100 mt-2">
                                Download a complete archive of your data in JSON format
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center p-8">
                            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                                This will create a ZIP file containing all your tasks, journal entries, family information, 
                                wellness logs, and more. You can use this for backup or data portability.
                            </p>
                            
                            <Button 
                                onClick={handleExport} 
                                disabled={isExporting} 
                                size="lg" 
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-5 w-5" /> 
                                        Download My Data Archive
                                    </>
                                )}
                            </Button>
                            
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-red-700">
                                        <ServerCrash className="h-4 w-4" />
                                        <span className="text-sm font-medium">{error}</span>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}