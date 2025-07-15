import { useState } from 'react';

const PlaceholderImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholderText = 'No Image Available',
  showIcon = true,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // If no src provided or image failed to load, show placeholder
  if (!src || imageError) {
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        {...props}
      >
        {showIcon && (
          <svg 
            className="w-12 h-12 mb-2 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        )}
        <span className="text-sm font-medium text-center px-2">
          {placeholderText}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Loading placeholder while image loads */}
      {!imageLoaded && (
        <div 
          className={`flex items-center justify-center bg-gray-200 ${className}`}
          {...props}
        >
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 bg-gray-300 rounded mb-2"></div>
            <div className="w-16 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'hidden' : ''}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </>
  );
};

export default PlaceholderImage;
