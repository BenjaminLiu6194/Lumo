// src/components/ConversationCamera.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ConversationCameraProps {
  onEndConversation: () => void;
  userMessage: string;
  onMessageChange: (message: string) => void;
}

export function ConversationCamera({
  onEndConversation,
  userMessage,
  onMessageChange,
}: ConversationCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleEndConversation = () => {
    stopCamera();
    onEndConversation();
  };

  if (error) {
    return (
      <div className="text-center animate-fade-in">
        <div className="bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-400/40 p-6 mb-6">
          <p className="text-white text-lg font-semibold mb-2">Camera Error</p>
          <p className="text-white/80">{error}</p>
        </div>
        <Button
          onClick={handleEndConversation}
          className="shine-hover rounded-2xl px-8 py-4 text-lg font-semibold border border-white/30 bg-gray-600/60 hover:bg-gray-600/70 text-white backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center animate-fade-in">
      {/* Video feed container */}
      <div className="relative mb-6 mx-auto max-w-2xl">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-white/10 backdrop-blur-lg">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-10">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}

          {/* Camera Active indicator - positioned in top right corner */}
          <div className="absolute top-3 right-3 z-20">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-500/80 backdrop-blur-md rounded-full border border-green-400/60">
              <div className="w-1.5 h-1.5 bg-green-200 rounded-full animate-pulse"></div>
              <span className="text-green-100 text-xs font-medium">
                Camera Active
              </span>
            </div>
          </div>

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto aspect-video object-cover"
            style={{ transform: "scaleX(-1)" }} // Mirror the video for natural feel
          />
          {/* Subtle glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20 rounded-3xl blur opacity-75 animate-pulse"></div>
        </div>

        {/* Small message input below video */}
        <div className="mt-3 max-w-md mx-auto">
          <input
            type="text"
            value={userMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Add a short message..."
            className="w-full px-3 py-2 text-sm bg-white/15 backdrop-blur-md border border-white/25 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-blue-400/60 focus:border-blue-400/60 transition-all duration-200"
            maxLength={50}
          />
        </div>
      </div>

      {/* End Conversation button */}
      <Button
        onClick={handleEndConversation}
        className="shine-hover rounded-2xl px-10 py-5 text-xl font-semibold border border-white/30 bg-gradient-to-r from-blue-600/60 via-violet-600/60 to-blue-600/60 hover:from-blue-600/70 hover:via-violet-600/70 hover:to-blue-600/70 text-white backdrop-blur-lg backdrop-saturate-150 shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-violet-300/40 transform hover:scale-105"
      >
        End Conversation
      </Button>
    </div>
  );
}
