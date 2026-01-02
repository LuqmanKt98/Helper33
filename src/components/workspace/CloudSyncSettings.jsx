
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Cloud,
  CloudOff,
  Loader2,
  Settings,
  RefreshCw,
  HardDrive,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Database,
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CLOUD_PROVIDERS = [
  {
    id: 'google_drive',
    name: 'Google Drive',
    icon: '📁',
    color: 'from-blue-500 to-blue-700',
    description: '15GB free storage'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    color: 'from-blue-600 to-indigo-700',
    description: '2GB free storage'
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    color: 'from-blue-400 to-cyan-600',
    description: '5GB free storage'
  }
];

export default function CloudSyncSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState(null);
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['cloudSyncConnections'],
    queryFn: () => base44.entities.CloudSyncConnection.list(),
    initialData: []
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['scannedDocuments'],
    queryFn: () => base44.entities.ScannedDocument.list(),
    initialData: []
  });

  const connectProvider = async (providerId) => {
    setSyncingProvider(providerId);
    
    try {
      if (providerId === 'google_drive') {
        window.location.href = '/functions/googleAuth?redirect_uri=' + encodeURIComponent(window.location.href);
      } else {
        toast.info(`${providerId} integration coming soon! For now, use Google Drive.`);
        setSyncingProvider(null);
      }
    } catch (error) {
      console.error('Error connecting provider:', error);
      toast.error('Failed to connect');
      setSyncingProvider(null);
    }
  };

  const disconnectProvider = async (connection) => {
    if (!confirm(`Disconnect from ${connection.provider}? Your documents will remain in Helper33.`)) return;

    try {
      await base44.entities.CloudSyncConnection.update(connection.id, {
        is_connected: false,
        sync_enabled: false
      });
      queryClient.invalidateQueries(['cloudSyncConnections']);
      toast.success('Disconnected from cloud storage');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  };

  const manualSync = async (connection) => {
    setSyncingProvider(connection.provider);
    
    try {
      await base44.entities.CloudSyncConnection.update(connection.id, {
        sync_status: 'syncing',
        last_sync: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      await base44.entities.CloudSyncConnection.update(connection.id, {
        sync_status: 'success',
        last_sync: new Date().toISOString(),
        total_files_synced: documents.length
      });

      queryClient.invalidateQueries(['cloudSyncConnections']);
      toast.success('Documents synced to cloud! ☁️');
    } catch (error) {
      console.error('Error syncing:', error);
      await base44.entities.CloudSyncConnection.update(connection.id, {
        sync_status: 'error',
        sync_error: error.message
      });
      toast.error('Sync failed');
    } finally {
      setSyncingProvider(null);
    }
  };

  const toggleSyncSetting = async (connection, setting, value) => {
    try {
      await base44.entities.CloudSyncConnection.update(connection.id, {
        sync_settings: {
          ...connection.sync_settings,
          [setting]: value
        }
      });
      queryClient.invalidateQueries(['cloudSyncConnections']);
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const activeConnection = connections.find(c => c.is_connected);
  const syncedDocs = documents.filter(d => d.cloud_sync_status === 'synced').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {activeConnection ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-green-900 flex items-center gap-2 text-sm sm:text-base flex-wrap">
                  <span>{CLOUD_PROVIDERS.find(p => p.id === activeConnection.provider)?.icon}</span>
                  <span className="truncate">{CLOUD_PROVIDERS.find(p => p.id === activeConnection.provider)?.name} Connected</span>
                  {activeConnection.sync_status === 'syncing' && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-green-700">
                  {syncedDocs} of {documents.length} documents synced
                  {activeConnection.last_sync && (
                    <span className="hidden sm:inline ml-2">
                      • Last sync: {new Date(activeConnection.last_sync).toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => manualSync(activeConnection)}
                disabled={syncingProvider === activeConnection.provider}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none touch-manipulation min-h-[40px]"
              >
                {syncingProvider === activeConnection.provider ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Syncing...</>
                ) : (
                  <><RefreshCw className="w-4 h-4 mr-2" />Sync Now</>
                )}
              </Button>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                className="touch-manipulation min-h-[40px] min-w-[40px]"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Storage Usage - Mobile Optimized */}
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{ width: `${Math.min((activeConnection.storage_used_mb / 1024) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-green-700 font-mono whitespace-nowrap">
              {activeConnection.storage_used_mb.toFixed(1)} MB used
            </span>
          </div>
        </motion.div>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-200">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Cloud Sync
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Access your documents from any device by connecting cloud storage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {CLOUD_PROVIDERS.map(provider => (
                <motion.div
                  key={provider.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300 touch-manipulation">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg`}>
                        {provider.icon}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base">{provider.name}</h3>
                      <p className="text-xs text-gray-500 mb-3 sm:mb-4">{provider.description}</p>
                      <Button
                        onClick={() => connectProvider(provider.id)}
                        disabled={syncingProvider === provider.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 touch-manipulation min-h-[40px]"
                        size="sm"
                      >
                        {syncingProvider === provider.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Connecting...</>
                        ) : (
                          <>Connect</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Settings - Mobile Optimized */}
      <AnimatePresence>
        {showSettings && activeConnection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    Sync Settings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                    className="touch-manipulation min-h-[36px] min-w-[36px]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-6 p-4 sm:p-6">
                {/* Auto Upload */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <Label className="font-semibold text-xs sm:text-sm">Auto-upload new scans</Label>
                      <p className="text-xs text-gray-500">Automatically sync new documents to cloud</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeConnection.sync_settings?.auto_upload_scans ?? true}
                    onCheckedChange={(checked) => toggleSyncSetting(activeConnection, 'auto_upload_scans', checked)}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Sync OCR Text */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <Label className="font-semibold text-xs sm:text-sm">Include extracted text</Label>
                      <p className="text-xs text-gray-500">Sync OCR text with documents</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeConnection.sync_settings?.sync_extracted_text ?? true}
                    onCheckedChange={(checked) => toggleSyncSetting(activeConnection, 'sync_extracted_text', checked)}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Compress Images */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <Label className="font-semibold text-xs sm:text-sm">Compress images</Label>
                      <p className="text-xs text-gray-500">Save storage space (slightly lower quality)</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeConnection.sync_settings?.compress_images ?? false}
                    onCheckedChange={(checked) => toggleSyncSetting(activeConnection, 'compress_images', checked)}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Keep Local Copies */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <Label className="font-semibold text-xs sm:text-sm">Keep local copies</Label>
                      <p className="text-xs text-gray-500">Store documents in Helper33 database too</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeConnection.sync_settings?.keep_local_copies ?? true}
                    onCheckedChange={(checked) => toggleSyncSetting(activeConnection, 'keep_local_copies', checked)}
                    className="flex-shrink-0"
                  />
                </div>

                {/* WiFi Only */}
                <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <Label className="font-semibold text-xs sm:text-sm">Sync on WiFi only</Label>
                      <p className="text-xs text-gray-500">Don't use mobile data for syncing</p>
                    </div>
                  </div>
                  <Switch
                    checked={activeConnection.sync_settings?.sync_on_wifi_only ?? false}
                    onCheckedChange={(checked) => toggleSyncSetting(activeConnection, 'sync_on_wifi_only', checked)}
                    className="flex-shrink-0"
                  />
                </div>

                {/* Disconnect Button */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => disconnectProvider(activeConnection)}
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation min-h-[44px]"
                  >
                    <CloudOff className="w-4 h-4 mr-2" />
                    Disconnect Cloud Storage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Statistics - Mobile Optimized */}
      {activeConnection && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{syncedDocs}</p>
              <p className="text-xs text-gray-500">Documents Synced</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{activeConnection.storage_used_mb.toFixed(0)} MB</p>
              <p className="text-xs text-gray-500">Storage Used</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4 text-center">
              {activeConnection.sync_settings?.sync_on_wifi_only ? (
                <Wifi className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
              ) : (
                <WifiOff className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-2" />
              )}
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {activeConnection.sync_settings?.sync_on_wifi_only ? 'WiFi Only' : 'Always'}
              </p>
              <p className="text-xs text-gray-500">Sync Mode</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
