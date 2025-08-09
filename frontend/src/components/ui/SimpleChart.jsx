// Simple Chart Component
// Lightweight chart component for financial analytics without external dependencies

import { useState } from 'react';

const SimpleChart = ({ 
  data, 
  type = 'bar', 
  title, 
  height = 200, 
  color = '#3B82F6',
  showValues = true,
  formatValue = (value) => value
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="text-gray-400 text-center py-8">No data available</div>
      </div>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;

  // Calculate bar heights as percentages
  const normalizedData = data.map(item => ({
    ...item,
    percentage: range > 0 ? ((item.value - minValue) / range) * 100 : 50
  }));

  if (type === 'line') {
    return <LineChart data={normalizedData} title={title} height={height} color={color} formatValue={formatValue} />;
  }

  return (
    <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full space-x-1">
          {normalizedData.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Bar */}
              <div
                className="w-full rounded-t transition-all duration-200 cursor-pointer"
                style={{
                  height: `${item.percentage}%`,
                  backgroundColor: hoveredIndex === index ? '#60A5FA' : color,
                  minHeight: '4px'
                }}
              />
              
              {/* Label */}
              <div className="mt-2 text-xs text-gray-400 text-center truncate w-full">
                {item.label}
              </div>
              
              {/* Value tooltip */}
              {hoveredIndex === index && (
                <div className="absolute bottom-full mb-2 bg-midnight-800 border border-midnight-600 rounded px-2 py-1 text-xs text-white whitespace-nowrap z-10">
                  {formatValue(item.value)}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue * 0.75)}</span>
          <span>{formatValue(maxValue * 0.5)}</span>
          <span>{formatValue(maxValue * 0.25)}</span>
          <span>{formatValue(minValue)}</span>
        </div>
      </div>
      
      {/* Values below chart */}
      {showValues && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-gray-400">{item.label}</div>
              <div className="text-white font-semibold">{formatValue(item.value)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Line Chart Component
const LineChart = ({ data, title, height, color, formatValue }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));

  // Generate SVG path for line
  const generatePath = () => {
    if (data.length === 0) return '';

    const width = 100; // percentage
    const stepX = width / (data.length - 1);
    
    return data.map((item, index) => {
      const x = index * stepX;
      const y = 100 - item.percentage; // Flip Y coordinate
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="25" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 25" fill="none" stroke="#374151" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Line */}
          <path
            d={generatePath()}
            fill="none"
            stroke={color}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - item.percentage;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={hoveredIndex === index ? '#60A5FA' : color}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute bg-midnight-800 border border-midnight-600 rounded px-2 py-1 text-xs text-white whitespace-nowrap z-10 pointer-events-none"
            style={{
              left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
              top: `${100 - data[hoveredIndex].percentage}%`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-8px'
            }}
          >
            <div>{data[hoveredIndex].label}</div>
            <div className="font-semibold">{formatValue(data[hoveredIndex].value)}</div>
          </div>
        )}
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-12">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue * 0.75)}</span>
          <span>{formatValue(maxValue * 0.5)}</span>
          <span>{formatValue(maxValue * 0.25)}</span>
          <span>{formatValue(minValue)}</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        {data.map((item, index) => (
          <span key={index} className={index % 2 === 0 ? '' : 'hidden md:inline'}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data, title, size = 200, centerText }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="text-gray-400 text-center py-8">No data available</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const innerRadius = 50;
  const center = 100;

  let cumulativePercentage = 0;

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const createArcPath = (startAngle, endAngle) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="bg-midnight-900 border border-midnight-700 rounded-lg p-6">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chart */}
        <div className="relative">
          <svg width={size} height={size} viewBox="0 0 200 200">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = cumulativePercentage * 3.6;
              const endAngle = (cumulativePercentage + percentage) * 3.6;
              
              cumulativePercentage += percentage;

              return (
                <path
                  key={index}
                  d={createArcPath(startAngle, endAngle)}
                  fill={hoveredIndex === index ? '#60A5FA' : colors[index % colors.length]}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          {centerText && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{centerText.value}</div>
                <div className="text-sm text-gray-400">{centerText.label}</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-gray-300 text-sm">{item.label}</span>
              <span className="text-white font-semibold text-sm">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleChart;
