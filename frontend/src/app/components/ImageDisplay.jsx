// ./src/app/components/ImageDisplay.jsx

import React, { useState } from 'react';
import Image from 'next/image';

/**
 * Component for displaying images with fallback and error handling
 * 
 * @param {Object} props
 * @param {string} props.imagePath - Path or filename of the image
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Type of image (reference, quality, etc.)
 * @param {boolean} props.showPlaceholder - Whether to show placeholder when no image
 * @param {Function} props.onClick - Click handler for the image
 */
const ImageDisplay = ({ 
  imagePath, 
  alt = "Image", 
  className = "", 
  type = "default",
  showPlaceholder = true,
  onClick = null
}) => {
  const [isError, setIsError] = useState(false);
  
  // Define additional classes based on image type
  const typeClasses = {
    reference: "border-2 border-blue-300 p-1",
    qualityPass: "border-2 border-green-300 p-1",
    qualityFail: "border-2 border-red-300 p-1",
    default: ""
  };
  
  // Handle image loading error
  const handleError = () => {
    setIsError(true);
  };
  
// Get the final image URL
const getImageUrl = () => {
  let resultUrl;
  
  // If there's an error or no image path and we want to show placeholder
  if (isError || (!imagePath && showPlaceholder)) {
    resultUrl = '/api/images/No Image Available.webp';
    console.log('Using placeholder image:', resultUrl);
  }
  // If image path starts with http/https, use it directly
  else if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    resultUrl = imagePath;
    console.log('Using direct URL:', resultUrl);
  }
  // Otherwise, use the API
  else {
    resultUrl = imagePath ? `/api/images/${imagePath}` : null;
    // console.log('Using API path:', resultUrl);
    // console.log('Original image path:', imagePath);
  }
  
  return resultUrl;
};
  
  // If no image and not showing placeholder, return null
  if (!imagePath && !showPlaceholder) {
    return null;
  }
  
  return (
    <Image 
      src={getImageUrl()}
      alt={alt}
      className={`${typeClasses[type] || ''} ${className}`}
      onError={handleError}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    />
  );
};

export default ImageDisplay;