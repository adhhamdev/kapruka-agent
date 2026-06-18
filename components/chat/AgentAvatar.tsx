import Image from 'next/image';
import { AGENT_AVATAR_SRC, APP_NAME } from '@/constants/brand';

const SIZE_CLASS = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  nav: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
} as const;

const IMAGE_SIZES = {
  sm: '28px',
  md: '32px',
  nav: '40px',
  lg: '64px',
  xl: '96px',
} as const;

interface AgentAvatarProps {
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  showRing?: boolean;
}

export function AgentAvatar({
  size = 'md',
  className = '',
  showRing = false,
}: AgentAvatarProps) {
  return (
    <div
      className={`${SIZE_CLASS[size]} rounded-full shrink-0 relative overflow-hidden mb-0.5 ${
        showRing
          ? 'shadow-[var(--shadow-sm)]'
          : ''
      } ${className}`}>
      <Image
        src={AGENT_AVATAR_SRC}
        alt={APP_NAME}
        fill
        sizes={IMAGE_SIZES[size]}
        className='object-contain drop-shadow-lg'
        priority={size === 'xl'}
      />
    </div>
  );
}
