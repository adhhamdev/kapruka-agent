'use client';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import {
  widgetRevealTransition,
  widgetRevealVariants,
} from '@/lib/motion/presets';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface AnimatedWidgetProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export function AnimatedWidget({
  children,
  index = 0,
  className = '',
}: AnimatedWidgetProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial='hidden'
      animate='visible'
      variants={widgetRevealVariants}
      transition={widgetRevealTransition(index)}>
      {children}
    </motion.div>
  );
}
