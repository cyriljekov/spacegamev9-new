'use client'

import { useState, useEffect } from 'react'

interface SettingsModalProps {
  onClose: () => void
}

interface Settings {
  textSpeed: 'slow' | 'normal' | 'fast' | 'instant'
  autoSave: boolean
  autoSaveInterval: number
  showTutorials: boolean
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'normal' | 'large'
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    textSpeed: 'normal',
    autoSave: true,
    autoSaveInterval: 5,
    showTutorials: true,
    reducedMotion: false,
    highContrast: false,
    fontSize: 'normal'
  })
  
  const [activeTab, setActiveTab] = useState<'gameplay' | 'display' | 'accessibility'>('gameplay')
  
  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('game-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])
  
  const handleSave = () => {
    localStorage.setItem('game-settings', JSON.stringify(settings))
    onClose()
  }
  
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-space-gray border-2 border-echo-blue max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-mono text-echo-blue">SETTINGS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['gameplay', 'display', 'accessibility'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 px-4 py-2 font-mono uppercase
                ${activeTab === tab
                  ? 'bg-echo-blue/20 text-echo-blue border-b-2 border-echo-blue'
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'gameplay' && (
            <div className="space-y-6">
              {/* Text Speed */}
              <div>
                <label className="block text-white font-mono mb-2">TEXT SPEED</label>
                <div className="flex gap-2">
                  {(['slow', 'normal', 'fast', 'instant'] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => updateSetting('textSpeed', speed)}
                      className={`
                        px-4 py-2 font-mono text-sm
                        ${settings.textSpeed === speed
                          ? 'bg-echo-blue text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                      `}
                    >
                      {speed.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Auto-Save */}
              <div>
                <label className="flex items-center gap-3 text-white font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => updateSetting('autoSave', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>ENABLE AUTO-SAVE</span>
                </label>
                {settings.autoSave && (
                  <div className="mt-2 ml-7">
                    <label className="block text-sm text-gray-400 mb-1">Interval (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.autoSaveInterval}
                      onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 bg-black border border-gray-700 text-white font-mono"
                    />
                  </div>
                )}
              </div>
              
              {/* Tutorials */}
              <div>
                <label className="flex items-center gap-3 text-white font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showTutorials}
                    onChange={(e) => updateSetting('showTutorials', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>SHOW TUTORIAL HINTS</span>
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-white font-mono mb-2">FONT SIZE</label>
                <div className="flex gap-2">
                  {(['small', 'normal', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`
                        px-4 py-2 font-mono
                        ${settings.fontSize === size
                          ? 'bg-echo-blue text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }
                      `}
                      style={{
                        fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px'
                      }}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="border border-gray-700 p-4">
                <p className="text-gray-400 font-mono mb-2">PREVIEW:</p>
                <p className={`
                  text-white font-mono
                  ${settings.fontSize === 'small' ? 'text-xs' : settings.fontSize === 'large' ? 'text-lg' : 'text-sm'}
                `}>
                  The quick brown fox jumps over the lazy dog.<br/>
                  System diagnostics: All systems operational.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              {/* Reduced Motion */}
              <div>
                <label className="flex items-center gap-3 text-white font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>REDUCE MOTION</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  Reduces animations and transitions
                </p>
              </div>
              
              {/* High Contrast */}
              <div>
                <label className="flex items-center gap-3 text-white font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => updateSetting('highContrast', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>HIGH CONTRAST MODE</span>
                </label>
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  Increases contrast for better visibility
                </p>
              </div>
              
              {/* Keyboard Shortcuts */}
              <div>
                <h3 className="text-white font-mono mb-3">KEYBOARD SHORTCUTS</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quick Save</span>
                    <span className="text-echo-blue">F5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quick Load</span>
                    <span className="text-echo-blue">F9</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Toggle Mode</span>
                    <span className="text-echo-blue">TAB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Inventory</span>
                    <span className="text-echo-blue">I</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Settings</span>
                    <span className="text-echo-blue">ESC</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between">
          <button
            onClick={() => {
              setSettings({
                textSpeed: 'normal',
                autoSave: true,
                autoSaveInterval: 5,
                showTutorials: true,
                reducedMotion: false,
                highContrast: false,
                fontSize: 'normal'
              })
            }}
            className="px-4 py-2 bg-gray-700 text-gray-300 font-mono hover:bg-gray-600"
          >
            RESET TO DEFAULTS
          </button>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white font-mono hover:bg-gray-600"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-echo-blue text-black font-mono hover:bg-blue-400"
            >
              SAVE SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}