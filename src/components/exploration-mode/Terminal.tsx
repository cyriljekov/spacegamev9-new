'use client'

interface TerminalProps {
  history: Array<{type: 'user' | 'system' | 'echo', text: string}>
  terminalRef: React.RefObject<HTMLDivElement>
}

export function Terminal({ history, terminalRef }: TerminalProps) {
  return (
    <div 
      ref={terminalRef}
      className="h-full overflow-y-auto p-4 font-mono text-sm"
    >
      {history.map((entry, index) => (
        <div key={index} className="mb-2">
          {entry.type === 'user' && (
            <div className="text-white">
              <span className="text-terminal-green mr-2">{'>'}</span>
              {entry.text}
            </div>
          )}
          {entry.type === 'system' && (
            <div className="text-gray-300 whitespace-pre-wrap">
              {entry.text}
            </div>
          )}
          {entry.type === 'echo' && (
            <div className="text-echo-purple italic">
              ECHO: {entry.text}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}