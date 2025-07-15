import React, { useState } from 'react';
import LoadingSpinner, { LoadingOverlay, InlineLoader } from '../components/ui/LoadingSpinner';
import AutoPartsLoader, { AutoPartsOverlay } from '../components/ui/AutoPartsLoader';

const LoadingDemo = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showAutoPartsOverlay, setShowAutoPartsOverlay] = useState(false);

  const handleShowOverlay = () => {
    setShowOverlay(true);
    // Auto-hide after 3 seconds for demo
    setTimeout(() => setShowOverlay(false), 3000);
  };

  const handleShowAutoPartsOverlay = () => {
    setShowAutoPartsOverlay(true);
    // Auto-hide after 4 seconds for demo
    setTimeout(() => setShowAutoPartsOverlay(false), 4000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Auto Parts Loading Components Demo
      </h1>

      {/* Gear Variants */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Gear Loading Spinners</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Small Gear</h3>
            <LoadingSpinner size="sm" text="Loading parts..." variant="gear" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Medium Gear</h3>
            <LoadingSpinner size="md" text="Searching inventory..." variant="gear" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Large Gear</h3>
            <LoadingSpinner size="lg" text="Processing order..." variant="gear" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Extra Large Gear</h3>
            <LoadingSpinner size="xl" text="Updating catalog..." variant="gear" />
          </div>
        </div>
      </div>

      {/* Auto Parts Themed Loaders */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Auto Parts Themed Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Multi-Gear System</h3>
            <AutoPartsLoader size="lg" text="Processing parts..." variant="multi-gear" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Engine Block</h3>
            <AutoPartsLoader size="lg" text="Engine diagnostics..." variant="engine" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Wrench Tool</h3>
            <AutoPartsLoader size="lg" text="Maintenance mode..." variant="wrench" />
          </div>
        </div>
      </div>

      {/* Other Variants */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Alternative Loading Styles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Simple Spinner</h3>
            <LoadingSpinner size="lg" text="Loading..." variant="simple" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">Dots Animation</h3>
            <LoadingSpinner size="lg" text="Please wait..." variant="dots" />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-medium mb-4">No Text</h3>
            <LoadingSpinner size="lg" showText={false} variant="gear" />
          </div>
        </div>
      </div>

      {/* Inline Loaders */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Inline Loading Components</h2>
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex items-center justify-between p-4 border rounded">
            <span>Checking part availability...</span>
            <InlineLoader text="Checking..." variant="gear" size="sm" />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded">
            <span>Updating cart...</span>
            <InlineLoader text="Updating..." variant="simple" size="sm" />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded">
            <span>Processing payment...</span>
            <InlineLoader text="Processing..." variant="dots" size="sm" />
          </div>
        </div>
      </div>

      {/* Full Screen Overlay Demo */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Full Screen Loading Overlay</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="mb-4 text-gray-600">
            Click the button below to see a full-screen loading overlay with gear animation.
            Perfect for major operations like placing orders or loading large catalogs.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleShowOverlay}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Show Basic Overlay
            </button>
            <button
              onClick={handleShowAutoPartsOverlay}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Show Auto Parts Overlay
            </button>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Usage Examples</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Code Examples:</h3>
          <div className="space-y-4 text-sm">
            <div className="bg-white p-4 rounded border">
              <strong>Basic Gear Spinner:</strong>
              <code className="block mt-2 text-blue-600">
                {`<LoadingSpinner size="md" text="Loading parts..." variant="gear" />`}
              </code>
            </div>
            
            <div className="bg-white p-4 rounded border">
              <strong>Full Screen Overlay:</strong>
              <code className="block mt-2 text-blue-600">
                {`<LoadingOverlay isVisible={loading} text="Processing order..." variant="gear" />`}
              </code>
            </div>
            
            <div className="bg-white p-4 rounded border">
              <strong>Inline Loader:</strong>
              <code className="block mt-2 text-blue-600">
                {`<InlineLoader text="Updating..." variant="gear" size="sm" />`}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay Components */}
      <LoadingOverlay
        isVisible={showOverlay}
        text="Processing your auto parts order..."
        variant="gear"
      />

      <AutoPartsOverlay
        isVisible={showAutoPartsOverlay}
        text="Analyzing engine components..."
        variant="multi-gear"
      />
    </div>
  );
};

export default LoadingDemo;
