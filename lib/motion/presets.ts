/** Hallmark motion tokens — transform + opacity only */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const DUR_SHORT_S = 0.18;
export const DUR_MEDIUM_S = 0.28;

export const listItemTransition = (index = 0) => ({
  duration: DUR_MEDIUM_S,
  delay: Math.min(index * 0.045, 0.22),
  ease: EASE_OUT,
});

export const cartListVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: {
    opacity: 0,
    x: -14,
    scale: 0.96,
    transition: { duration: DUR_SHORT_S, ease: EASE_OUT },
  },
};

export const messageBubbleVariants = {
  user: {
    hidden: { opacity: 0, x: 14, y: 6, scale: 0.98 },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
  },
  assistant: {
    hidden: { opacity: 0, x: -14, y: 8, scale: 0.98 },
    visible: { opacity: 1, x: 0, y: 0, scale: 1 },
  },
};

export const widgetRevealTransition = (index = 0) => ({
  duration: DUR_MEDIUM_S,
  delay: 0.08 + Math.min(index * 0.07, 0.28),
  ease: EASE_OUT,
});

export const widgetRevealVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const carouselCardTransition = (index: number) => ({
  duration: DUR_MEDIUM_S,
  delay: Math.min(index * 0.05, 0.35),
  ease: EASE_OUT,
});

export const carouselCardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};
