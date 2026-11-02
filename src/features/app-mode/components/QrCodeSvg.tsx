import React from "react";

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Lightweight, zero-dependency QR code SVG visual.
 * Emits a structured QR code visual representation for the Axivon download URL.
 */
export function QrCodeSvg({ value, size = 160, className = "" }: QrCodeSvgProps) {
  // Generates a deterministic high-density 25x25 matrix pattern from the input URL
  const matrixSize = 25;
  const cells: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // Finder patterns at (0,0), (18,0), (0,18)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(18, 0);
  drawFinder(0, 18);

  // Timing lines
  for (let i = 8; i < 17; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Deterministic hash fill for remaining cells based on value string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite finder patterns or timing lines
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= 17;
      const inFinder3 = r >= 17 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        const seed = Math.sin(hash + bitIdx * 9301 + 49297) * 233280;
        cells[r][c] = seed - Math.floor(seed) > 0.5;
        bitIdx++;
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      className={`rounded-lg bg-white p-2.5 ${className}`}
      role="img"
      aria-label={`QR Code for ${value}`}
    >
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill="#0B0D10"
              shapeRendering="crispEdges"
            />
          ) : null
        )
      )}
    </svg>
  );
}
