'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import {
  getProductImageFallback,
  resolveProductImageSrc,
} from '@/lib/product-image';

type ProductImageProps = Omit<ImageProps, 'src' | 'alt' | 'onError'> & {
  src?: string | null;
  alt: string;
};

export function ProductImage({ src, alt, ...props }: ProductImageProps) {
  const initial = resolveProductImageSrc(src);
  const [imgSrc, setImgSrc] = useState(initial);

  useEffect(() => {
    setImgSrc(resolveProductImageSrc(src));
  }, [src]);

  const handleError = () => {
    const fallback = getProductImageFallback();
    setImgSrc((current) => (current === fallback ? current : fallback));
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
