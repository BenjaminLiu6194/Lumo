// src/components/AudioResponsiveBall.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface AudioResponsiveBallProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isVisible?: boolean; // For showing gentle animation when not actively listening/speaking
}

export function AudioResponsiveBall({
  isListening = false,
  isSpeaking = false,
  isVisible = true,
}: AudioResponsiveBallProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [breathingScale, setBreathingScale] = useState(1);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const shouldBeActive = isListening || isSpeaking;

    if (shouldBeActive && !isInitialized) {
      if (isListening) {
        initializeAudio();
      } else if (isSpeaking) {
        simulateAudioAnimation();
      }
      setIsInitialized(true);
    } else if (!shouldBeActive && isInitialized) {
      cleanup();
      setIsInitialized(false);
    }

    return () => cleanup();
  }, [isListening, isSpeaking, isInitialized]);

  // Breathing animation effect
  useEffect(() => {
    const shouldBeActive = isListening || isSpeaking || isVisible;
    if (!shouldBeActive) return;

    let animationId: number;
    const startTime = Date.now();

    const updateBreathing = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const breathing = 1 + Math.sin(elapsed * 0.5) * 0.08; // Slow breathing effect
      setBreathingScale(breathing);

      if (isListening || isSpeaking || isVisible) {
        animationId = requestAnimationFrame(updateBreathing);
      }
    };

    updateBreathing();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isListening, isSpeaking, isVisible]);

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context and analyser
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Start analyzing audio
      analyzeAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // Fallback to simulated animation if microphone access fails
      simulateAudioAnimation();
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateAudioLevel = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average audio level
      const average =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

      setAudioLevel(normalizedLevel);

      if (isListening || isSpeaking) {
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };

    updateAudioLevel();
  };

  const simulateAudioAnimation = () => {
    // Fallback animation that simulates audio input
    let time = 0;
    const animate = () => {
      time += 0.1;
      const simulatedLevel =
        (Math.sin(time) + Math.sin(time * 2.3) + Math.sin(time * 4.1)) / 6 +
        0.5;
      setAudioLevel(Math.max(0, Math.min(1, simulatedLevel)));

      if (isListening || isSpeaking) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current = null;
    }

    setAudioLevel(0);
  };

  // Calculate the scale based on audio level combined with breathing animation
  // Use a base scale when just visible (not actively listening/speaking)
  const baseScale = isListening || isSpeaking ? 0.8 + audioLevel * 0.6 : 1.0;
  const scale = baseScale * breathingScale;

  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      {/* Main audio-responsive ball with LUMO gradient */}
      <div
        className="absolute inset-0 rounded-full plaid-text-animation-ball transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${scale})`,
          background:
            "linear-gradient(45deg, #3b82f6, #06b6d4, #10b981, #6366f1, #8b5cf6)",
          backgroundSize: "200% 200%",
          animation:
            "plaidAnimation 15s ease-in-out infinite, ballBreathing 3s ease-in-out infinite",
        }}
      />

      {/* Outer glow ring that also responds to audio */}
      <div
        className="absolute -inset-4 rounded-full opacity-30 transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${scale * 1.2})`,
          background:
            "linear-gradient(45deg, #3b82f6, #06b6d4, #10b981, #6366f1, #8b5cf6)",
          backgroundSize: "200% 200%",
          animation: "plaidAnimation 15s ease-in-out infinite",
          filter: "blur(8px)",
        }}
      />

      {/* Inner highlight */}
      <div
        className="absolute inset-4 rounded-full bg-white/20 transition-transform duration-75 ease-out"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}
