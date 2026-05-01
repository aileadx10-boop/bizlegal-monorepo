'use client'

import { cn } from '@/lib/utils'

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number
  pauseOnHover?: boolean
  direction?: 'left' | 'right'
  fade?: boolean
}

export function Marquee({
  children,
  className,
  duration = 30,
  pauseOnHover = false,
  direction = 'left',
  fade = true,
  ...props
}: MarqueeProps) {
  const animationName = direction === 'left' ? 'marquee-scroll' : 'marquee-scroll-reverse'

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div
        className={cn('flex w-full overflow-hidden', className)}
        style={{
          ...(fade && {
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }),
        }}
        {...props}
      >
        <div
          className="flex shrink-0"
          style={{
            animation: `${animationName} ${duration}s linear infinite`,
          }}
          onMouseEnter={(e) => {
            if (pauseOnHover) e.currentTarget.style.animationPlayState = 'paused'
          }}
          onMouseLeave={(e) => {
            if (pauseOnHover) e.currentTarget.style.animationPlayState = 'running'
          }}
        >
          {children}
          {children}
        </div>
      </div>
    </>
  )
}