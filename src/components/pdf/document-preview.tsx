"use client";

import * as React from "react";

const DOC_WIDTH = 794; // A4 @ 96dpi

/**
 * Scales a fixed-width (794px) document to fit the available container width
 * for on-screen preview, while the underlying node keeps its true size so
 * exports stay crisp.
 */
export function DocumentPreview({ children }: { children: React.ReactNode }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const [height, setHeight] = React.useState<number>();

  React.useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const update = () => {
      const available = container.clientWidth;
      const next = Math.min(1, available / DOC_WIDTH);
      setScale(next);
      setHeight(inner.scrollHeight * next);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-xl border bg-slate-100 p-3 shadow-inner sm:p-6 dark:bg-slate-900"
    >
      <div style={{ height }} className="mx-auto" >
        <div
          ref={innerRef}
          style={{
            width: DOC_WIDTH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="doc-scale shadow-xl"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
