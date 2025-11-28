import React from 'react';

// Simple wrapper for the <lord-icon> web component from Lordicon CDN.
// Props:
// - src: URL to the lordicon JSON or animation (e.g. "https://cdn.lordicon.com/xxx.json")
// - trigger: 'hover' | 'click' | 'loop' | 'morph' | 'none' (default 'hover')
// - colors: string (e.g. 'primary:#121331,secondary:#08a88a')
// - style / className: standard React props
// - stroke: numeric stroke width (optional)

export default function LordIcon({ src, trigger = 'hover', colors, style, className, stroke, size }) {
  const styleWithSize = size ? { width: size, height: size, ...style } : style;

  // React will render unknown elements fine; attributes must be passed as-is.
  return (
    <lord-icon
      src={src}
      trigger={trigger}
      colors={colors}
      stroke={stroke}
      style={styleWithSize}
      class={className}
      aria-hidden
    ></lord-icon>
  );
}
