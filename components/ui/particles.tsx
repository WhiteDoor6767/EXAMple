"use client";

import React, { useEffect, useRef, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
}

function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  strokeColor?: string;
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): number[] {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const int = parseInt(cleanHex, 16);
  if (isNaN(int)) return [0, 0, 0];
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return [r, g, b];
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 120,
  staticity = 40,
  ease = 40,
  size = 4,
  refresh = false,
  color = "#FFE500",
  strokeColor = "#000000",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  const colorKey = `${color}:${strokeColor}`;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    startAnimation();

    window.addEventListener("resize", initCanvas);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", initCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorKey]);

  useEffect(() => {
    onMouseMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    initCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = [];
      const w = canvasContainerRef.current.offsetWidth || window.innerWidth;
      const h = canvasContainerRef.current.offsetHeight || window.innerHeight;
      canvasSize.current.w = w;
      canvasSize.current.h = h;
      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;
      canvasRef.current.style.width = `${w}px`;
      canvasRef.current.style.height = `${h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * (canvasSize.current.w || 800));
    const y = Math.floor(Math.random() * (canvasSize.current.h || 600));
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 3) + size;
    const alpha = 0.2;
    const targetAlpha = parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)); // High contrast 0.6–1.0
    const dx = (Math.random() - 0.5) * 0.4;
    const dy = (Math.random() - 0.5) * 0.4;
    const magnetism = 0.2 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const rgb = hexToRgb(color);
  const strokeRgb = hexToRgb(strokeColor);

  const drawCircle = (circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      
      // Bright yellow fill
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
      context.current.fill();

      // High-contrast black border around each yellow dot so it pops vividly on white background!
      context.current.lineWidth = 1.5;
      context.current.strokeStyle = `rgba(${strokeRgb.join(", ")}, ${alpha * 0.9})`;
      context.current.stroke();

      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearCanvas = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w || window.innerWidth,
        canvasSize.current.h || window.innerHeight
      );
    }
  };

  const drawParticles = () => {
    clearCanvas();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const startAnimation = () => {
    const loop = () => {
      clearCanvas();
      circles.current.forEach((circle: Circle, i: number) => {
        const edge = [
          circle.x + circle.translateX - circle.size < 0,
          canvasSize.current.w - (circle.x + circle.translateX + circle.size) < 0,
          circle.y + circle.translateY - circle.size < 0,
          canvasSize.current.h - (circle.y + circle.translateY + circle.size) < 0,
        ];

        if (edge[0] || edge[1]) circle.dx = -circle.dx;
        if (edge[2] || edge[3]) circle.dy = -circle.dy;

        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        circle.translateX +=
          (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
          ease;
        circle.translateY +=
          (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
          ease;

        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.current.w + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.current.h + circle.size
        ) {
          circles.current.splice(i, 1);
          const newCircle = circleParams();
          drawCircle(newCircle);
        } else {
          drawCircle(
            {
              ...circle,
              x: circle.x,
              y: circle.y,
              translateX: circle.translateX,
              translateY: circle.translateY,
              alpha:
                circle.alpha < circle.targetAlpha
                  ? circle.alpha + 0.05
                  : circle.targetAlpha,
            },
            true
          );
        }
      });
      animationFrameId.current = window.requestAnimationFrame(loop);
    };

    loop();
  };

  return (
    <div
      className={`pointer-events-none ${className}`}
      ref={canvasContainerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
};
