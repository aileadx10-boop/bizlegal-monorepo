import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Fade up on scroll (section reveals)
gsap.registerEffect({
  name: 'fadeUpOnScroll',
  effect: (targets: any, config: any) => {
    const elements = gsap.utils.toArray(targets)
    const triggers: ScrollTrigger[] = []

    elements.forEach((element: any) => {
      gsap.set(element, {
        opacity: 0,
        y: config.yOffset || 40,
      })

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: config.start || 'top 80%',
        once: config.once !== false,
        onEnter: () => {
          gsap.to(element, {
            duration: config.duration || 0.8,
            opacity: 1,
            y: 0,
            ease: config.ease || 'sine.out',
          })
        },
      })

      triggers.push(trigger)
    })

    return triggers
  },
  defaults: {
    duration: 0.8,
    yOffset: 40,
    ease: 'sine.out',
    start: 'top 80%',
    once: true,
  },
})

// Stagger fade up on scroll (feature lists)
gsap.registerEffect({
  name: 'staggerFadeUpOnScroll',
  effect: (targets: any, config: any) => {
    const containers = gsap.utils.toArray<HTMLElement>(targets)
    const triggers: ScrollTrigger[] = []

    containers.forEach((container) => {
      const children = config.childSelector
        ? Array.from(container.querySelectorAll(config.childSelector))
        : Array.from(container.children)

      if (children.length === 0) return

      gsap.set(children, {
        opacity: 0,
        y: config.yOffset || 40,
      })

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: config.start || 'top 85%',
        once: config.once !== false,
        onEnter: () => {
          gsap.to(children, {
            duration: config.duration || 0.7,
            opacity: 1,
            y: 0,
            ease: config.ease || 'sine.out',
            stagger: config.stagger || 0.12,
          })
        },
      })

      triggers.push(trigger)
    })

    return triggers
  },
  defaults: {
    duration: 0.7,
    yOffset: 40,
    ease: 'sine.out',
    start: 'top 85%',
    once: true,
    stagger: 0.12,
  },
})

export const animationUtils = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
  stagger: {
    show: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  },
}
