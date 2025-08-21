'use client'

import { useViewport } from '@/hooks/useViewport'

interface QuickActionsProps {
  onCommand: (command: string) => void
}

export function QuickActions({ onCommand }: QuickActionsProps) {
  const viewport = useViewport()
  
  const actions = [
    { label: viewport.isMobile ? 'INV' : '/inventory', command: 'inventory' },
    { label: viewport.isMobile ? 'HP' : '/health', command: 'health' },
    { label: viewport.isMobile ? 'ECHO' : '/echo', command: 'echo status' },
    { label: viewport.isMobile ? 'BACK' : '/return', command: 'return' },
    { label: viewport.isMobile ? '?' : '/help', command: 'help' }
  ]
  
  return (
    <div className={`
      grid gap-2 mt-3 sm:mt-4
      ${viewport.isMobile ? 'grid-cols-3' : 'grid-cols-5'}
    `}>
      {actions.map(action => (
        <button
          key={action.command}
          onClick={() => onCommand(action.command)}
          className="
            bg-[#0a0a0a] border border-[#222] text-gray-500
            px-2 sm:px-3 py-2 sm:py-[6px] text-[10px] sm:text-[11px] uppercase tracking-[0.5px]
            font-mono cursor-pointer transition-all duration-200
            hover:bg-[#111] hover:text-white hover:border-[#333]
            min-h-[44px] sm:min-h-0
          "
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}