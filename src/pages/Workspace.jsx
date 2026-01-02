import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Briefcase,
  Scan,
  FileText,
  Cloud,
  Users,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '@/components/SEO';
import DocumentScanner from '@/components/workspace/DocumentScanner';
import ScannerLibrary from '@/components/workspace/ScannerLibrary';
import CloudSyncSettings from '@/components/workspace/CloudSyncSettings';
import SharedWithMe from '@/components/workspace/SharedWithMe';

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('scanner');

  const workspaceTools = [
    { id: 'scanner', name: 'Document Scanner', icon: Scan, description: 'Scan, enhance, and manage documents', color: 'from-blue-500 to-cyan-600' },
    { id: 'homework', name: 'Homework Hub', icon: GraduationCap, description: 'AI study assistant & practice questions', color: 'from-purple-500 to-pink-600', isNew: true },
    { id: 'cloud', name: 'Cloud Sync', icon: Cloud, description: 'Sync across all devices', color: 'from-green-500 to-emerald-600' },
    { id: 'shared', name: 'Shared With Me', icon: Users, description: 'View shared documents', color: 'from-indigo-500 to-purple-600' },
    { id: 'notes', name: 'Quick Notes', icon: FileText, description: 'Fast note-taking', color: 'from-orange-500 to-amber-600' }
  ];

  return (
    <>
      <SEO 
        title="Workspace - Helper33 | Document Scanner, Homework Hub & Productivity Tools"
        description="Professional workspace with advanced document scanner featuring OCR, AI-powered homework help with practice questions, cloud sync, and document management. Study smarter and work efficiently."
        keywords="document scanner, OCR, homework help, AI study assistant, PDF generator, cloud sync, workspace tools, productivity app, scan documents, practice questions, student tools"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/90 backdrop-blur-xl rounded-full border border-blue-200/50 mb-3 sm:mb-4 shadow-xl"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Professional Workspace
              </span>
            </motion.div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4 px-4">
              Your Digital
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent ml-2 sm:ml-3">
                Workspace
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Scan documents, get AI homework help, sync to cloud, and boost your productivity.
            </p>
          </motion.div>

          {/* Workspace Tools Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {workspaceTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tool.id === 'homework' ? (
                    <Link to={createPageUrl('HomeworkHub')}>
                      <Card className="cursor-pointer transition-all touch-manipulation hover:shadow-2xl bg-white/90 backdrop-blur-sm active:scale-95 border-2 border-purple-300 relative overflow-hidden group">
                        {tool.isNew && (
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10"
                          >
                            NEW!
                          </motion.div>
                        )}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <CardContent className="p-4 sm:p-6 text-center relative z-10">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}
                          >
                            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </motion.div>
                          <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">{tool.name}</h3>
                          <p className="text-xs text-gray-500 hidden sm:block mb-2">{tool.description}</p>
                          <motion.div
                            className="flex items-center justify-center gap-1 text-purple-600 font-semibold text-xs group-hover:gap-2 transition-all"
                          >
                            Open
                            <ArrowRight className="w-3 h-3" />
                          </motion.div>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Card
                      onClick={() => setActiveTab(tool.id)}
                      className={`cursor-pointer transition-all touch-manipulation ${
                        activeTab === tool.id 
                          ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
                          : 'hover:shadow-lg bg-white/80 backdrop-blur-sm active:scale-95'
                      }`}
                    >
                      <CardContent className="p-4 sm:p-6 text-center">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">{tool.name}</h3>
                        <p className="text-xs text-gray-500 hidden sm:block">{tool.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Main Content Area - Mobile Optimized */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="scanner">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <DocumentScanner />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <ScannerLibrary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cloud">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <CloudSyncSettings />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <ScannerLibrary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shared">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <SharedWithMe />
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <ScannerLibrary />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12 sm:py-16">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-gray-500">Quick Notes coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}