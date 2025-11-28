import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

// AnimatedIcon: loads a Lottie JSON from public/animations and renders it
export default function AnimatedIcon({ src, autoplay = true, loop = true, size = 24, className = "" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!src) return;
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load animation: ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch((e) => {
        if (!mounted) return;
        console.error("AnimatedIcon load error:", e);
        setErr(e.message);
      });
    return () => {
      mounted = false;
    };
  }, [src]);

  if (err || !data) {
    return <div style={{ width: size, height: size }} className={className} aria-hidden />;
  }

  return (
    <div style={{ width: size, height: size }} className={className}>
      <Lottie animationData={data} loop={loop} autoplay={autoplay} style={{ width: size, height: size }} />
    </div>
  );
}
