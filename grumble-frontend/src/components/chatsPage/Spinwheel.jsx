import React, { useState } from 'react';

const getColor = (index) => {
  const palette = ['#F78660', '#FFCC7A', '#2945A8'];
  return palette[index % palette.length];
};

const SpinWheel = ({ options }) => {
  const [spinning,  setSpinning]  = useState(false);
  const [rotation,  setRotation]  = useState(0);
  const [result,    setResult]    = useState(null);

  const count = options.length;
  const angle = 360 / count;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const extra  = Math.floor(Math.random() * 360);
    const spins  = 1440 + extra;
    const newRot = rotation + spins;
    setRotation(newRot);
    setTimeout(() => {
      const normalized = ((newRot % 360) + 360) % 360;
      const idx = Math.floor((360 - normalized) / angle) % count;
      setResult(options[idx]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
          }}
        >
          {options.map((opt, i) => {
            const startAngle = (i * angle * Math.PI) / 180;
            const endAngle   = ((i + 1) * angle * Math.PI) / 180;
            const x1 = 100 + 90 * Math.cos(startAngle);
            const y1 = 100 + 90 * Math.sin(startAngle);
            const x2 = 100 + 90 * Math.cos(endAngle);
            const y2 = 100 + 90 * Math.sin(endAngle);
            const mx = 100 + 55 * Math.cos((startAngle + endAngle) / 2);
            const my = 100 + 55 * Math.sin((startAngle + endAngle) / 2);
            const largeArc = angle > 180 ? 1 : 0;
            return (
              <g key={i}>
                <path
                  d={`M100,100 L${x1},${y1} A90,90 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={getColor(i)}
                  stroke="white"
                  strokeWidth="2"
                />
                <text
                  x={mx} y={my}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  transform={`rotate(${i * angle + angle / 2}, ${mx}, ${my})`}
                >
                  {opt.length > 6 ? opt.slice(0, 6) + '…' : opt}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="10" fill="white" />
        </svg>

        {/* Pointer */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1">
          <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[14px] border-t-transparent border-b-transparent border-r-gray-700" />
        </div>
      </div>

      {result && (
        <p className="text-sm font-bold text-[#F78660]">🎉 {result}!</p>
      )}

      <button
        onClick={spin}
        disabled={spinning}
        className="btn-primary px-6 py-2 rounded-full text-sm font-bold disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : 'SPIN THE WHEEL'}
      </button>
    </div>
  );
};

export default SpinWheel;