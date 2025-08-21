'use client'

export type CardType = 'gm' | 'player' | 'echo' | 'survivor' | 'system' | 'danger'

interface ExplorationCardProps {
  type: CardType
  content: string
  animationDelay?: number
}

export function ExplorationCard({ type, content, animationDelay = 0 }: ExplorationCardProps) {
  const getCardStyles = () => {
    switch (type) {
      case 'gm':
        return {
          card: 'bg-[#0a0a0a] border-[#111] text-[#999]',
          accent: 'bg-[#00ff41]',
          textSize: 'text-[14px] leading-[1.7]'
        }
      case 'player':
        return {
          card: 'bg-[#080808] border-[#111] text-white italic',
          accent: 'bg-white',
          textSize: 'text-[14px]'
        }
      case 'echo':
        return {
          card: 'bg-[#0a0a0a] border-[#111] text-[#00b4d8]',
          accent: 'bg-[#00b4d8]',
          textSize: 'text-[13px] leading-[1.6]'
        }
      case 'survivor':
        return {
          card: 'bg-[#0a0a0a] border-[#111] text-[#b794f6]',
          accent: 'bg-[#b794f6]',
          textSize: 'text-[14px] leading-[1.6]'
        }
      case 'system':
        return {
          card: 'bg-[#ffb70008] border-[#ffb70033] text-[#ffb700] text-center',
          accent: 'bg-[#ffb700]',
          textSize: 'text-[11px] uppercase tracking-[1px]'
        }
      case 'danger':
        return {
          card: 'bg-[#ff004008] border-[#ff004033] text-[#ff0040] text-center',
          accent: 'bg-[#ff0040]',
          textSize: 'text-[11px] uppercase tracking-[1px]'
        }
      default:
        return {
          card: 'bg-[#0a0a0a] border-[#111] text-gray-400',
          accent: 'bg-gray-400',
          textSize: 'text-[14px]'
        }
    }
  }
  
  const styles = getCardStyles()
  const isSystemCard = type === 'system' || type === 'danger'
  
  return (
    <div 
      className={`
        relative overflow-hidden border mb-3
        ${styles.card}
        ${isSystemCard ? 'px-5 py-3' : 'px-6 py-5'}
        animate-slideIn
      `}
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'both'
      }}
    >
      {/* Accent bar */}
      <div 
        className={`
          absolute left-0 top-0 bottom-0 w-[2px] 
          ${styles.accent}
          transition-all duration-300
          hover:w-[3px]
        `}
      />
      
      {/* Content */}
      <div className={`${styles.textSize} font-mono whitespace-pre-wrap`}>
        {type === 'echo' && !content.startsWith('ECHO:') && 'ECHO: '}
        {type === 'survivor' && !content.includes(':') && 'VOICE: '}
        {content}
      </div>
    </div>
  )
}