'use client'

interface ProgressBarProps {
  value: number
  max: number
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'gray'
  showLabel?: boolean
  label?: string
  height?: 'thin' | 'normal'
}

export function ProgressBar({ 
  value, 
  max, 
  color = 'blue',
  showLabel = false,
  label,
  height = 'thin'
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const colors = {
    blue: 'bg-[#00b4d8]',
    purple: 'bg-[#b794f6]',
    green: 'bg-[#00ff41]',
    amber: 'bg-[#ffb700]',
    red: 'bg-[#ff0040]',
    gray: 'bg-[#666]'
  }
  
  const heights = {
    thin: 'h-[2px]',
    normal: 'h-[4px]'
  }
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.5px]">
            {label}
          </span>
          <span className="text-[10px] text-white font-medium">
            {value}/{max}
          </span>
        </div>
      )}
      <div className={`${heights[height]} bg-[#333] relative overflow-hidden`}>
        <div 
          className={`absolute inset-y-0 left-0 ${colors[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}