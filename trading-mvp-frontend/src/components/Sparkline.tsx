import { useState } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  label?: string;
}

export default function Sparkline({
  data,
  width = 120,
  height = 24,
  color = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  label = 'Volume'
}: SparklineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Calculate points for the line
  const pointsData = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y, value };
  });

  const points = pointsData.map(p => `${p.x},${p.y}`).join(' ');

  // Create path for filled area
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest point
    const closestIndex = Math.round((x / width) * (data.length - 1));
    const validIndex = Math.max(0, Math.min(data.length - 1, closestIndex));

    setHoveredIndex(validIndex);
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative inline-block">
      <svg
        width={width}
        height={height}
        className="inline-block cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Filled area */}
        <polygon
          points={areaPoints}
          fill={fillColor}
          strokeWidth="0"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hover point */}
        {hoveredIndex !== null && (
          <circle
            cx={pointsData[hoveredIndex].x}
            cy={pointsData[hoveredIndex].y}
            r="3"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: `${mousePosition.x}px`,
            top: `${-30}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-semibold">{label}: {data[hoveredIndex].toFixed(0)}</div>
          <div className="text-gray-300 text-[10px]">Day {hoveredIndex + 1}</div>
        </div>
      )}
    </div>
  );
}
