import { AgentAvatar } from '@/components/chat/AgentAvatar';
import { KaprukaLink, KaprukaText } from '@/components/brand/KaprukaLink';
import { APP_NAME, KAPRUKA_LOGO_SRC } from '@/constants/brand';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header
      className='hidden lg:flex h-[60px] shrink-0 px-4 md:px-6 items-center justify-between z-30 bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)]'
      id='nav-header'>
      <div className='flex items-center gap-3 min-w-0'>
        <KaprukaLink
          className='inline-flex shrink-0 rounded-sm'
          variant='on-dark'
          ariaLabel='Shop at Kapruka.com'>
          <Image
            src={KAPRUKA_LOGO_SRC}
            alt=''
            width={120}
            height={40}
            className='h-8 w-auto object-contain'
            priority
            aria-hidden='true'
          />
        </KaprukaLink>
        <span className='w-px h-6 shrink-0' aria-hidden='true' />
        <AgentAvatar size='nav' className='mb-0 shrink-0' />
        <span
          className='font-semibold text-[15px] tracking-tight text-white leading-tight truncate'
          translate='no'>
          <KaprukaText variant='on-dark'>{APP_NAME}</KaprukaText>
        </span>
      </div>
    </header>
  );
}
