/* eslint-disable @typescript-eslint/no-explicit-any */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

// Register plugins
gsap.registerPlugin(ScrollTrigger);

interface FadeUpScrollConfig {
  start?: string;
  duration?: number;
  yOffset?: number;
  ease?: string;
  once?: boolean;
  markers?: boolean;
  delay?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

interface StaggerFadeUpOnScrollConfig {
  start?: string;
  duration?: number;
  yOffset?: number;
  ease?: string;
  once?: boolean;
  markers?: boolean;
  delay?: number;
  stagger?: number;
  childSelector?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

interface FadeUpConfig {
  duration?: number;
  yOffset?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

gsap.registerEffect({
  name: "fadeUp",
  effect: (targets: gsap.TweenTarget, config: FadeUpConfig) => {
    // Set initial state
    gsap.set(targets, {
      autoAlpha: 0,
      y: config.yOffset,
      opacity: 0,
    });

    // Return animation timeline
    return gsap.to(targets, {
      duration: config.duration,
      autoAlpha: 1,
      y: 0,
      opacity: 1,
      ease: config.ease,
      delay: config.delay,
      stagger: config.stagger,
      onStart: config.onStart,
      onComplete: config.onComplete,
    });
  },
  defaults: {
    duration: 0.8,
    yOffset: 50,
    ease: "sine.out",
    delay: 0,
    stagger: 0,
  },
  extendTimeline: true,
});

gsap.registerEffect({
  name: "fadeUpOnScroll",
  effect: (targets: gsap.TweenTarget, config: FadeUpScrollConfig) => {
    const elements = gsap.utils.toArray(targets);
    const triggers: ScrollTrigger[] = [];

    elements.forEach((element: any) => {
      gsap.set(element, {
        autoAlpha: 0,
        y: config.yOffset,
        opacity: 0,
      });

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: config.start,
        once: config.once,
        markers: config.markers,
        onEnter: () => {
          if (config.onStart) config.onStart();

          gsap.to(element, {
            duration: config.duration,
            autoAlpha: 1,
            y: 0,
            opacity: 1,
            ease: config.ease,
            delay: config.delay,
            onComplete: config.onComplete,
          });
        },
      });

      triggers.push(trigger);
    });

    return triggers;
  },
  defaults: {
    duration: 0.8,
    yOffset: 50,
    ease: "sine.out",
    start: "top 90%",
    once: true,
    markers: false,
    delay: 0,
  },
});

gsap.registerEffect({
  name: "staggerFadeUpOnScroll",
  effect: (targets: gsap.TweenTarget, config: StaggerFadeUpOnScrollConfig) => {
    const containers = gsap.utils.toArray<HTMLElement>(targets as HTMLElement[]);
    const triggers: ScrollTrigger[] = [];

    containers.forEach((container) => {
      const children: Element[] = config.childSelector
        ? Array.from(container.querySelectorAll(config.childSelector))
        : Array.from(container.children);

      if (children.length === 0) return;

      gsap.set(children, {
        autoAlpha: 0,
        y: config.yOffset,
        opacity: 0,
      });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: config.start,
        once: config.once,
        markers: config.markers,
        onEnter: () => {
          if (config.onStart) config.onStart();

          gsap.to(children, {
            duration: config.duration,
            autoAlpha: 1,
            y: 0,
            opacity: 1,
            ease: config.ease,
            delay: config.delay,
            stagger: config.stagger,
            onComplete: config.onComplete,
          });
        },
      });

      triggers.push(trigger);
    });

    return triggers;
  },
  defaults: {
    duration: 0.7,
    yOffset: 40,
    ease: "sine.out",
    start: "top 85%",
    once: true,
    markers: false,
    delay: 0,
    stagger: 0.12,
    childSelector: undefined,
  },
});
