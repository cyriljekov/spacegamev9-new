'use client'

interface ConnectionMonitorProps {
  isOnline: boolean
}

export function ConnectionMonitor({ isOnline }: ConnectionMonitorProps) {
  if (isOnline) return null

  return (
    <div className="fixed inset-0 bg-space-black flex items-center justify-center z-50">
      <div className="max-w-md p-8 border-2 border-terminal-red bg-space-gray">
        <h2 className="text-2xl text-terminal-red mb-4 font-mono">CONNECTION LOST</h2>
        <p className="text-gray-400 mb-4">
          Internet connection required to play Echoes of Earth.
        </p>
        <p className="text-gray-500 text-sm">
          Please check your connection and refresh the page.
        </p>
      </div>
    </div>
  )
}