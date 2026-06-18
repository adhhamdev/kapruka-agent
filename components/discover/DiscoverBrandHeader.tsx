import { KaprukaLink } from '@/components/brand/KaprukaLink';
import { KAPRUKA_LOGO_SRC } from '@/constants/brand';
import Image from 'next/image';

export function DiscoverBrandHeader() {
  return (
    <header
      className='lg:hidden shrink-0 flex items-center justify-center h-[56px] px-4 bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)]'
      id='discover-brand-header'>
      <KaprukaLink
        className='inline-flex items-center justify-center rounded-sm'
        ariaLabel='Shop at Kapruka.com'>
        <Image
          src={KAPRUKA_LOGO_SRC}
          alt=''
          width={140}
          height={48}
          className='h-9 w-auto max-w-[min(100%,10rem)] object-contain'
          priority
          aria-hidden='true'
        />
      </KaprukaLink>
    </header>
  );
}
