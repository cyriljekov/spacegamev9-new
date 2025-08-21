'use client'

interface QuickCommandsProps {
  onCommand: (command: string) => void
}

export function QuickCommands({ onCommand }: QuickCommandsProps) {
  const commands = [
    { label: 'LOOK', command: 'look', color: 'bg-gray-700' },
    { label: 'SCAN', command: 'scan', color: 'bg-echo-purple' },
    { label: 'INVENTORY', command: 'inventory', color: 'bg-gray-700' },
    { label: 'NORTH', command: 'move north', color: 'bg-gray-700' },
    { label: 'SOUTH', command: 'move south', color: 'bg-gray-700' },
    { label: 'EAST', command: 'move east', color: 'bg-gray-700' },
    { label: 'WEST', command: 'move west', color: 'bg-gray-700' },
    { label: 'RETURN', command: 'return', color: 'bg-terminal-amber' }
  ]
  
  return (
    <div className="flex gap-2 p-2 overflow-x-auto border-b border-gray-800">
      {commands.map(cmd => (
        <button
          key={cmd.command}
          onClick={() => onCommand(cmd.command)}
          className={`
            px-3 py-1 text-xs font-mono text-white
            ${cmd.color} hover:opacity-80 transition-opacity
            whitespace-nowrap
          `}
        >
          {cmd.label}
        </button>
      ))}
    </div>
  )
}