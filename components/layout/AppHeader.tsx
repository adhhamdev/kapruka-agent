import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { NewChatButton } from '@/components/chat/NewChatButton';
import { KaprukaLink, KaprukaText } from '@/components/brand/KaprukaLink';
import { KAPRUKA_LOGO_SRC } from '@/constants/brand';
import Image from 'next/image';
import Link from 'next/link';

interface AppHeaderProps {
  onStartNewChat: () => void;
  isChatPending?: boolean;
}

export function AppHeader({
  onStartNewChat,
  isChatPending = false,
}: AppHeaderProps) {
  return (
    <header
      className='flex shrink-0 items-center justify-between gap-3 z-30 bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)] px-3 sm:px-4 md:px-6 pt-[env(safe-area-inset-top)] min-h-[calc(52px+env(safe-area-inset-top))] lg:min-h-[calc(60px+env(safe-area-inset-top))]'
      id='nav-header'>
      <div className='flex items-center gap-2 sm:gap-3 min-w-0 py-2 lg:py-0 lg:h-[60px]'>
        <KaprukaLink
          className='inline-flex shrink-0 rounded-sm'
          variant='on-dark'
          ariaLabel='Shop at Kapruka.com'>
          <Image
            src={KAPRUKA_LOGO_SRC}
            alt=''
            width={120}
            height={40}
            className='h-7 sm:h-8 w-auto object-contain'
            priority
            aria-hidden='true'
          />
        </KaprukaLink>
        <Link href='/'>
          <div className='flex items-center gap-2'>
            <span className='w-px h-5 sm:h-6 bg-white/20 shrink-0' aria-hidden='true' />
            <AgentAvatar size='nav' className='mb-0 shrink-0' />
            <span
              className='font-semibold text-[13px] sm:text-[15px] tracking-tight text-white leading-tight truncate'
              translate='no'>
              <KaprukaText variant='on-dark'>Agent.</KaprukaText>
            </span>
          </div>
        </Link>
      </div>
      <NewChatButton onClick={onStartNewChat} disabled={isChatPending} />
    </header>
  );
}
