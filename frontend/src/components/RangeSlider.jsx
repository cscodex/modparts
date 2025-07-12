import { useState, useEffect, useRef } from 'react';

/**
 * A custom range slider component with two handles for min and max values
 *
 * @param {Object} props Component props
 * @param {number} props.min Minimum possible value
 * @param {number} props.max Maximum possible value
 * @param {number} props.minValue Current minimum selected value
 * @param {number} props.maxValue Current maximum selected value
 * @param {Function} props.onChange Callback when values change
 * @param {Function} props.onAfterChange Callback after user finishes dragging
 */
const RangeSlider = ({ min, max, minValue, maxValue, onChange, onAfterChange }) => {
  const [isDragging, setIsDragging] = useState(null); // 'min', 'max', or null
  const sliderRef = useRef(null);
  const range = max - min;

  // Calculate positions for the handles
  const getLeftPosition = (value) => {
    // Use logarithmic scale for better usability with large ranges
    if (range > 1000) {
      // For large ranges like 0-99999, use logarithmic scale for better usability
      const logMin = min === 0 ? 0 : Math.log(min);
      const logMax = Math.log(max);
      const logValue = value === 0 ? 0 : Math.log(value);
      const logRange = logMax - logMin;

      return ((logValue - logMin) / logRange) * 100;
    } else {
      // For smaller ranges, use linear scale
      return ((value - min) / range) * 100;
    }
  };

  const minPos = getLeftPosition(minValue);
  const maxPos = getLeftPosition(maxValue);

  // Handle mouse/touch events
  const handleMouseDown = (e, handle) => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(null);
      if (onAfterChange) {
        onAfterChange({ min: minValue, max: maxValue });
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const sliderWidth = rect.width;

    // Get mouse position relative to slider
    const clientX = e.type.includes('touch')
      ? e.touches[0].clientX
      : e.clientX;

    const position = clientX - rect.left;
    const percentage = Math.min(Math.max(position / sliderWidth, 0), 1);

    // Calculate value based on linear or logarithmic scale
    let value;
    if (range > 1000) {
      // For large ranges, use logarithmic scale
      const logMin = min === 0 ? 0 : Math.log(min);
      const logMax = Math.log(max);
      const logRange = logMax - logMin;

      // Convert percentage to logarithmic value
      const logValue = percentage * logRange + logMin;
      value = Math.round(Math.exp(logValue));

      // Handle special case for min=0
      if (percentage < 0.01 && min === 0) {
        value = 0;
      }
    } else {
      // For smaller ranges, use linear scale
      value = Math.round(percentage * range + min);
    }

    if (isDragging === 'min') {
      // Ensure min doesn't exceed max - 1
      const newMinValue = Math.min(value, maxValue - 1);
      onChange({ min: newMinValue, max: maxValue });
    } else if (isDragging === 'max') {
      // Ensure max doesn't go below min + 1
      const newMaxValue = Math.max(value, minValue + 1);
      onChange({ min: minValue, max: newMaxValue });
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    const handleGlobalMouseMove = (e) => {
      handleMouseMove(e);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalMouseMove);
      document.addEventListener('touchend', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalMouseMove);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="relative w-full h-6 mt-8 mb-4">
      {/* Slider track */}
      <div
        ref={sliderRef}
        className="absolute h-2 w-full bg-gray-300 rounded-full top-1/2 transform -translate-y-1/2"
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-blue-600 rounded-full"
          style={{
            left: `${minPos}%`,
            width: `${maxPos - minPos}%`
          }}
        />
      </div>

      {/* Min handle */}
      <div
        className={`absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-grab ${isDragging === 'min' ? 'cursor-grabbing' : ''}`}
        style={{ left: `${minPos}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'min')}
        onTouchStart={(e) => handleMouseDown(e, 'min')}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={minValue}
        tabIndex={0}
      />

      {/* Max handle */}
      <div
        className={`absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-grab ${isDragging === 'max' ? 'cursor-grabbing' : ''}`}
        style={{ left: `${maxPos}%` }}
        onMouseDown={(e) => handleMouseDown(e, 'max')}
        onTouchStart={(e) => handleMouseDown(e, 'max')}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={maxValue}
        tabIndex={0}
      />
    </div>
  );
};

export default RangeSlider;
