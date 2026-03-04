import React from "react";

// Types for your data
export interface TrendData {
  date: string;
  alignment: number; // 0 to 10
  energy: number; // 0 to 10
}

interface TrendsChartProps {
  data?: TrendData[];
}

const TrendsChart = ({ data = [] }: TrendsChartProps) => {
  // Image ke according Y-axis points (linear scale pe perfectly map hote hain)
  const yTicks = [
    { value: 10, top: "0%" },
    { value: 6, top: "40%" },  // (10 - 6) / 10 * 100
    { value: 3, top: "70%" },  // (10 - 3) / 10 * 100
    { value: 0, top: "100%" }, // (10 - 0) / 10 * 100
  ];

  // Helper to place points evenly on X-axis
  const getX = (index: number, total: number) => {
    if (total === 1) return 50; // Agar sirf ek din ka data ho toh center mein dikhaye
    return (index / (total - 1)) * 100;
  };

  return (
    <div className="w-full rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="mb-8 text-xl font-bold text-foreground">
        Alignment & Energy Trends (Last 14 Days)
      </h3>

      {/* Chart Canvas Area */}
      <div className="relative h-64 w-full pl-8 pr-4">
        
        {/* Main Y-Axis Vertical Line */}
        <div className="absolute bottom-0 left-8 top-0 border-l border-border" />

        {/* 1. Render Background Grid & Labels */}
        {yTicks.map((tick) => (
          <div
            key={tick.value}
            className="absolute left-0 right-4 flex items-center"
            style={{ top: tick.top }}
          >
            {/* Number Label */}
            <span className="absolute left-0 w-6 -translate-y-1/2 text-right text-sm text-muted-foreground">
              {tick.value}
            </span>

            {/* Tiny tick mark on the axis */}
            <div className="absolute left-7 h-px w-1.5 -translate-y-1/2 bg-border" />

            {/* Dashed Grid Line */}
            <div className="ml-8 w-full -translate-y-1/2 border-t border-dashed border-border" />
          </div>
        ))}

        {/* 2. Render Data Lines & Dots (Only if data exists) */}
        {data && data.length > 0 && (
          <div className="absolute bottom-0 left-8 right-4 top-0">
            {/* SVG purely for drawing the connecting lines cleanly */}
            <svg
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Alignment Line (Teal) */}
              <polyline
                points={data
                  .map((d, i) => `${getX(i, data.length)},${100 - d.alignment * 10}`)
                  .join(" ")}
                fill="none"
                stroke="#14b8a6" // Tailwind teal-500
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Energy Line (Orange) */}
              <polyline
                points={data
                  .map((d, i) => `${getX(i, data.length)},${100 - d.energy * 10}`)
                  .join(" ")}
                fill="none"
                stroke="#f97316" // Tailwind orange-500
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* HTML Absolute Divs for Perfect Unstretched Dots */}
            {data.map((d, i) => (
              <React.Fragment key={`dots-${i}`}>
                {/* Alignment Dot */}
                <div
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#14b8a6] bg-background z-10"
                  style={{
                    left: `${getX(i, data.length)}%`,
                    top: `${100 - d.alignment * 10}%`,
                  }}
                />
                {/* Energy Dot */}
                <div
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f97316] bg-background z-10"
                  style={{
                    left: `${getX(i, data.length)}%`,
                    top: `${100 - d.energy * 10}%`,
                  }}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Legend Area */}
      <div className="mt-8 flex items-center justify-center gap-6">
        {/* Alignment Legend */}
        <div className="flex items-center gap-2">
          <div className="relative flex w-6 items-center justify-center">
            <div className="absolute h-0.5 w-full bg-[#14b8a6]" />
            <div className="absolute h-2 w-2 rounded-full border-2 border-[#14b8a6] bg-background" />
          </div>
          <span className="text-sm font-medium text-[#14b8a6]">Alignment</span>
        </div>

        {/* Energy Legend */}
        <div className="flex items-center gap-2">
          <div className="relative flex w-6 items-center justify-center">
            <div className="absolute h-0.5 w-full bg-[#f97316]" />
            <div className="absolute h-2 w-2 rounded-full border-2 border-[#f97316] bg-background" />
          </div>
          <span className="text-sm font-medium text-[#f97316]">Energy</span>
        </div>
      </div>
      
    </div>
  );
};

export default TrendsChart;