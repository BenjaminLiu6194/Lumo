// src/components/ui/CMUFuturisticBackground.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

const CMUFuturisticBackground = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bubbleAnimations = useMemo(() => {
    if (!isClient) {
      // Return static animations for SSR to prevent hydration errors
      return Array.from({ length: 8 }, (_, index) => ({
        initial: { y: "-110vh", x: "50vw", scale: 0, opacity: 0 },
        animate: {
          y: "110vh",
          x: "50vw",
          scale: [0, 1, 1],
          opacity: [0, 0.45, 0.25, 0],
          transition: {
            duration: 30,
            repeat: Infinity,
            repeatType: "loop" as const,
            delay: index * 2,
            ease: "linear" as const,
          },
        },
      }));
    }

    // Generate random animations for the client
    return Array.from({ length: 8 }, (_, index) => {
      const startX = Math.random() * 100;
      const endX = Math.random() * 100;
      const duration = Math.random() * 20 + 25;

      return {
        initial: {
          y: "-110vh", // Start from the top
          x: `${startX}vw`,
          scale: 0,
          opacity: 0,
        },
        animate: {
          y: "110vh", // Animate to the bottom
          x: `${endX}vw`,
          scale: [0, 1.2, 1],
          opacity: [0, 0.5, 0.3, 0],
          transition: {
            duration,
            repeat: Infinity,
            repeatType: "loop" as const,
            delay: index * 2,
            ease: "linear" as const,
          },
        },
      };
    });
  }, [isClient]);

  const bubbles = [
    // New vibrant, Stripe-inspired colors
    {
      size: "60vw",
      color: "radial-gradient(circle, #ee7752, rgba(231, 60, 126, 0.4))",
    },
    {
      size: "50vw",
      color: "radial-gradient(circle, #e73c7e, rgba(35, 166, 213, 0.4))",
    },
    {
      size: "70vw",
      color: "radial-gradient(circle, #23a6d5, rgba(35, 213, 171, 0.4))",
    },
    {
      size: "55vw",
      color: "radial-gradient(circle, #23d5ab, rgba(238, 119, 82, 0.4))",
    },
    {
      size: "65vw",
      color: "radial-gradient(circle, #e73c7e, rgba(238, 119, 82, 0.4))",
    },
    {
      size: "45vw",
      color: "radial-gradient(circle, #23a6d5, rgba(231, 60, 126, 0.4))",
    },
    {
      size: "75vw",
      color: "radial-gradient(circle, #23d5ab, rgba(35, 166, 213, 0.4))",
    },
    {
      size: "80vw",
      color: "radial-gradient(circle, #ee7752, rgba(35, 213, 171, 0.4))",
    },
  ];

  return (
    <div className="animated-gradient-background fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none opacity-80">
      <div className="absolute inset-0 overflow-hidden">
        {bubbles.map((bubble, i) => {
          const animation = bubbleAnimations[i];
          if (!animation) return null;
          return (
            <motion.div
              key={`bubble-${i}`}
              initial={animation.initial}
              animate={animation.animate}
              style={{
                position: "absolute",
                width: bubble.size,
                height: bubble.size,
                borderRadius: "50%",
                background: bubble.color,
                filter: "blur(50px)",
                willChange: "transform, opacity",
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export { CMUFuturisticBackground };
