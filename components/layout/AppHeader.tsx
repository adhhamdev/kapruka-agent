import Image from 'next/image';

export function AppHeader() {
  return (
    <header
      className='h-[60px] shrink-0 px-4 md:px-6 flex items-center justify-between z-30 bg-[color:var(--color-primary)] shadow-[var(--shadow-sm)]'
      id='nav-header'>
      <div className='flex items-center gap-3 min-w-0'>
        <Image
          src='/logo-square.jpeg'
          alt='Kapruka logo'
          width={100}
          height={100}
          className='object-contain shrink-0'
          priority
        />
        <span
          className='font-semibold text-[15px] tracking-tight text-white leading-tight truncate'
          translate='no'>
          AGENT
        </span>
      </div>
    </header>
  );
}
