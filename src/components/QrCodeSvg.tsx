import React, { useMemo } from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({ value, size = 210 }) => {
  const gridSize = 25;

  const matrix = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    const isReserved = (r: number, c: number): boolean => {
      // Top-left finder + separator
      if (r < 8 && c < 8) return true;
      // Top-right finder + separator
      if (r < 8 && c >= gridSize - 8) return true;
      // Bottom-left finder + separator
      if (r >= gridSize - 8 && c < 8) return true;
      // Center badge area
      if (r >= 10 && r <= 14 && c >= 10 && c <= 14) return true;
      // Timing lines
      if (r === 6 || c === 6) return true;
      return false;
    };

    const drawFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[startR + r][startC + c] = isBorder || isInner;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, gridSize - 7);
    drawFinder(gridSize - 7, 0);

    // Timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Deterministic hash from value string
    let seed = 2166136261;
    for (let i = 0; i < value.length; i++) {
      seed ^= value.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (isReserved(r, c)) continue;
        seed ^= (r * 31 + c * 17) & 0xff;
        seed = Math.imul(seed, 16777619);
        grid[r][c] = (Math.abs(seed) % 10) < 5;
      }
    }

    return grid;
  }, [value]);

  return (
    <div
      className="relative inline-flex items-center justify-center bg-white p-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        {matrix.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1}
                height={1}
                fill="#0F0D0C"
              />
            ) : null
          )
        )}
      </svg>

      {/* Center Pop's Emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-10 h-10 rounded-xl bg-[#0F0D0C] border-2 border-white flex items-center justify-center shadow-md">
          <span className="text-[#E84A27] font-extrabold text-xs tracking-tighter">
            POP&apos;S
          </span>
        </div>
      </div>
    </div>
  );
};
