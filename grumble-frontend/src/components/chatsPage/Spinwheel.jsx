import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const getColor = (index) => {
  const palette = ["#F78660", "#FFCC7A", "#2945A8"];
  return palette[index % palette.length];
};

const SpinWheel = ({ options = [], sessionId, latestResult }) => {
  const safeOptions = useMemo(
    () => (Array.isArray(options) ? options : []),
    [options],
  );

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(latestResult || null);

  useEffect(() => {
    setResult(latestResult || null);
  }, [latestResult, sessionId]);

  const count = safeOptions.length;
  const angle = count > 0 ? 360 / count : 0;

  const spin = () => {
    if (spinning || count < 2) return;

    setSpinning(true);
    const extra = Math.floor(Math.random() * 360);
    const spins = 1440 + extra;
    const newRot = rotation + spins;
    setRotation(newRot);

    setTimeout(() => {
      const normalized = ((newRot % 360) + 360) % 360;
      const idx = Math.floor((360 - normalized) / angle) % count;
      const chosen = safeOptions[idx];

      setResult(chosen);
      setSpinning(false);

      if (!sessionId) return;

      void api
        .post(`/spin-wheels/${sessionId}/spin`, { result: chosen })
        .catch(() => {
          // Best-effort: keep local UI result even if persist fails.
        });
    }, 3000);
  };

  if (count === 0) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-80 h-80">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning
              ? "transform 3s cubic-bezier(0.17,0.67,0.12,0.99)"
              : "none",
          }}
        >
          {safeOptions.map((opt, i) => {
            const startAngle = (i * angle * Math.PI) / 180;
            const endAngle = ((i + 1) * angle * Math.PI) / 180;
            const x1 = 100 + 90 * Math.cos(startAngle);
            const y1 = 100 + 90 * Math.sin(startAngle);
            const x2 = 100 + 90 * Math.cos(endAngle);
            const y2 = 100 + 90 * Math.sin(endAngle);
            const mx = 100 + 58 * Math.cos((startAngle + endAngle) / 2);
            const my = 100 + 58 * Math.sin((startAngle + endAngle) / 2);
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
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  transform={`rotate(${i * angle + angle / 2}, ${mx}, ${my})`}
                >
                  {String(opt).length > 6
                    ? String(opt).slice(0, 6) + "…"
                    : String(opt)}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="10" fill="white" />
        </svg>

        {/* Pointer */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1">
          <div className="w-0 h-0 border-t-[12px] border-b-[12px] border-r-[20px] border-t-transparent border-b-transparent border-r-gray-700" />
        </div>
      </div>

      {result && (
        <p className="text-base font-bold text-[#F78660]">🎉 {result}!</p>
      )}

      <button
        onClick={spin}
        disabled={spinning || count < 2}
        className="btn-primary px-8 py-2.5 rounded-full text-base font-bold disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "SPIN THE WHEEL"}
      </button>
    </div>
  );
};

export default SpinWheel;