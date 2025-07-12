import { useEffect, useState } from 'react';

const ProgressBar = ({ progress, isVisible, onComplete }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    if (isVisible) {
      // Reset progress when becoming visible
      setAnimatedProgress(0);
      
      // Animate to the target progress
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, progress]);
  
  useEffect(() => {
    // Call onComplete when progress reaches 100%
    if (animatedProgress >= 100 && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Give a small delay for the user to see 100%
      
      return () => clearTimeout(timer);
    }
  }, [animatedProgress, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Exporting Data</h3>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${animatedProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(animatedProgress)}%</span>
        </div>
        
        <p className="mt-3 text-sm text-gray-600">
          {animatedProgress < 100 
            ? "Please wait while your file is being prepared..." 
            : "Export complete! Your download will begin shortly."}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
