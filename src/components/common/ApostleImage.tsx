import React from 'react';

interface ApostleImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const ApostleImage: React.FC<ApostleImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/src/assets/placeholder.webp',
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = fallbackSrc;
      }}
    />
  );
};

export default ApostleImage;
