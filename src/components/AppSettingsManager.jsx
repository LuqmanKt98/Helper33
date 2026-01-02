// ... keep existing code (imports) ...

export default function AppSettingsManager() {
  // ... keep existing code (queries and state) ...

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            App Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ... keep existing code (theme selection) ... */}

          <div className="space-y-4">
            <Label className="text-base font-semibold">Sound & Animations</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled" className="text-sm font-medium">
                  App Sounds
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable audio feedback for interactions
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.sound_enabled !== false}
                onCheckedChange={(checked) => 
                  updateSettings({ sound_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animation-level" className="text-sm font-medium">
                  Animations
                </Label>
                <p className="text-xs text-muted-foreground">
                  Control motion effects
                </p>
              </div>
              <select
                id="animation-level"
                value={settings.animation_level || 'full'}
                onChange={(e) => updateSettings({ animation_level: e.target.value })}
                className="border rounded-md px-3 py-1.5 text-sm bg-background"
              >
                <option value="full">Full</option>
                <option value="reduced">Reduced</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToyBrick className="w-5 h-5" />
            Kids Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Kids Studio is now always available!</p>
                <p>
                  Kids Studio provides a safe, creative space for children with games, 
                  learning activities, and journals. It's accessible to all users.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="kids-mode" className="text-sm font-medium">
                Kids Mode (Restricted Access)
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, only Kids Studio and Video Call are visible
              </p>
            </div>
            <Switch
              id="kids-mode"
              checked={settings.kids_mode_active || false}
              onCheckedChange={(checked) => 
                updateSettings({ kids_mode_active: checked })
              }
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> Kids Mode is designed for when a child is using the device. 
              Regular mode keeps Kids Studio accessible while showing all other features too.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ... keep existing code (remaining cards) ... */}
    </div>
  );
}