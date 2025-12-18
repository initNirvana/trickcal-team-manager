interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

function ApostleImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/src/assets/placeholder.webp',
}: ImageProps) {
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
}

export default ApostleImage;
