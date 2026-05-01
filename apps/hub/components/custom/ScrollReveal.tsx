"use client"

import { useRef, useEffect, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  /** Stagger children instead of animating the wrapper */
  stagger?: boolean
  /** CSS selector for stagger children (defaults to direct children) */
  childSelector?: string
  /** Vertical offset to animate from (px) */
  yOffset?: number
  /** Animation duration (s) */
  duration?: number
  /** Delay before animation starts (s) */
  delay?: number
  /** Stagger interval between children (s) */
  staggerAmount?: number
  /** ScrollTrigger start position */
  start?: string
}

export function ScrollReveal({
  children,
  className,
  style,
  stagger = false,
  childSelector,
  yOffset = 40,
  duration = 0.7,
  delay = 0,
  staggerAmount = 0.12,
  start = "top 88%",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (stagger) {
      const targets = childSelector
        ? Array.from(el.querySelectorAll(childSelector))
        : Array.from(el.children)

      if (targets.length === 0) return

      gsap.set(targets, { autoAlpha: 0, y: yOffset })

      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => {
          gsap.to(targets, {
            autoAlpha: 1,
            y: 0,
            duration,
            delay,
            stagger: staggerAmount,
            ease: "sine.out",
          })
        },
      })

      return () => trigger.kill()
    } else {
      gsap.set(el, { autoAlpha: 0, y: yOffset })

      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration,
            delay,
            ease: "sine.out",
          })
        },
      })

      return () => trigger.kill()
    }
  }, [stagger, childSelector, yOffset, duration, delay, staggerAmount, start])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
