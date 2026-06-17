import type { ChatRole } from '@/types/chat';

interface MarkdownContentProps {
  text: string;
  role?: ChatRole;
}

export function MarkdownContent({ text, role = 'assistant' }: MarkdownContentProps) {
  if (!text) return null;

  const isUser = role === 'user';
  const textClass = isUser
    ? 'text-white'
    : 'text-[color:var(--color-ink-2)]';
  const strongClass = isUser
    ? 'font-semibold text-white'
    : 'font-semibold text-[color:var(--color-ink)]';

  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, idx) => {
        let content: React.ReactNode = line;
        const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
        const isBullet = !!bulletMatch;
        const rawText = isBullet ? bulletMatch![1] : line;

        const parts = rawText.split(/\*\*([^*]+)\*\*/g);
        if (parts.length > 1) {
          content = parts.map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return (
                <strong key={pIdx} className={strongClass}>
                  {part}
                </strong>
              );
            }
            return part;
          });
        }

        if (isBullet) {
          return (
            <li
              key={idx}
              className={`ml-4 list-disc text-[15px] ${textClass} leading-relaxed mb-1.5`}>
              {content}
            </li>
          );
        }

        if (line.trim() === '') {
          return <div key={idx} className='h-2' />;
        }

        return (
          <p
            key={idx}
            className={`text-[15px] ${textClass} leading-relaxed mb-1.5`}>
            {content}
          </p>
        );
      })}
    </>
  );
}
