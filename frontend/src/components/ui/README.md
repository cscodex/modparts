# Auto Parts Loading Components

This directory contains custom loading components designed specifically for the auto parts website, featuring gear animations and automotive-themed loaders.

## Components

### 1. LoadingSpinner
A versatile loading component with multiple variants including a gear animation perfect for auto parts themes.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: string (default: 'Loading...')
- `showText`: boolean (default: true)
- `className`: string (default: '')
- `variant`: 'gear' | 'simple' | 'dots' (default: 'gear')

**Usage:**
```jsx
import LoadingSpinner from '../components/ui/LoadingSpinner';

<LoadingSpinner size="lg" text="Loading parts..." variant="gear" />
```

### 2. LoadingOverlay
A full-screen loading overlay with backdrop.

**Props:**
- `isVisible`: boolean
- `text`: string (default: 'Loading...')
- `variant`: 'gear' | 'simple' | 'dots' (default: 'gear')
- `backdrop`: boolean (default: true)

**Usage:**
```jsx
import { LoadingOverlay } from '../components/ui/LoadingSpinner';

<LoadingOverlay 
  isVisible={loading} 
  text="Processing order..." 
  variant="gear" 
/>
```

### 3. InlineLoader
A compact loading component for inline use.

**Props:**
- `text`: string (default: 'Loading...')
- `variant`: 'gear' | 'simple' | 'dots' (default: 'gear')
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'sm')

**Usage:**
```jsx
import { InlineLoader } from '../components/ui/LoadingSpinner';

<InlineLoader text="Updating..." variant="gear" size="sm" />
```

### 4. AutoPartsLoader
Advanced auto parts themed loader with multiple gear animations and automotive elements.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `text`: string (default: 'Loading...')
- `showText`: boolean (default: true)
- `className`: string (default: '')
- `variant`: 'multi-gear' | 'engine' | 'wrench' (default: 'multi-gear')

**Usage:**
```jsx
import AutoPartsLoader from '../components/ui/AutoPartsLoader';

<AutoPartsLoader size="lg" text="Processing parts..." variant="multi-gear" />
```

### 5. AutoPartsOverlay
Full-screen overlay with auto parts themed animations.

**Props:**
- `isVisible`: boolean
- `text`: string (default: 'Processing your auto parts request...')
- `variant`: 'multi-gear' | 'engine' | 'wrench' (default: 'multi-gear')
- `backdrop`: boolean (default: true)

**Usage:**
```jsx
import { AutoPartsOverlay } from '../components/ui/AutoPartsLoader';

<AutoPartsOverlay 
  isVisible={loading} 
  text="Analyzing engine components..." 
  variant="multi-gear" 
/>
```

## Demo

Visit `/loading-demo` to see all loading components in action with live examples.

## Styling

The components use Tailwind CSS classes and include custom CSS animations defined in `index.css`. The gear animations are optimized for smooth performance and visual appeal.

## Best Practices

1. **Use gear variants** for auto parts related operations
2. **Use multi-gear loader** for complex operations like order processing
3. **Use inline loaders** for button states and small UI updates
4. **Use overlays** for major operations that block user interaction
5. **Match the variant** to the context (e.g., 'engine' for diagnostics, 'wrench' for maintenance)

## Performance

All animations use CSS transforms and are GPU-accelerated for smooth performance. The components are lightweight and don't impact page load times.
