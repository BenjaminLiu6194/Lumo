// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CMUFuturisticBackground } from "@/components/ui/CMUFuturisticBackground";

type AppState = "idle" | "listening" | "processing" | "suggesting";

const mockSuggestions = [
  "I want an apple",
  "Can we go outside?",
  "I'm feeling happy",
];

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );

  // Speech synthesis function
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Start conversation flow
  const startConversation = () => {
    setState("listening");

    // Simulate listening for 3 seconds
    setTimeout(() => {
      setState("processing");

      // Simulate processing for 2 seconds
      setTimeout(() => {
        setState("suggesting");
      }, 2000);
    }, 3000);
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    speakText(suggestion);

    // Return to idle after a short delay
    setTimeout(() => {
      setState("idle");
      setSelectedSuggestion(null);
    }, 1500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (state === "idle" && e.key === "Enter") {
        startConversation();
      } else if (state === "suggesting") {
        if (e.key === "1") selectSuggestion(mockSuggestions[0]);
        if (e.key === "2") selectSuggestion(mockSuggestions[1]);
        if (e.key === "3") selectSuggestion(mockSuggestions[2]);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state]);
  return (
    <div className="relative w-full">
      <CMUFuturisticBackground />
      <div className="relative z-10">
        {/* Taller hero area: compact top, a bit more bottom space to extend gradient section */}
        <section className="relative flex-grow text-center flex items-center justify-center pt-4 pb-20 sm:pb-24">
          <div className="w-full max-w-screen-xl mx-auto relative z-10 px-4">
            <div className="animate-fade-in-up">
              {/* Slightly wider than the container using small negative margins */}
              <div className="-mx-2 sm:-mx-4 bg-white/40 backdrop-blur-lg rounded-[3rem] p-16 md:p-24 border border-white/50 shadow-2xl">
                <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white mb-10 leading-relaxed relative">
                  Multimodal Agentic AI Communication Tool for Nonverbal Users
                </p>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-tight relative text-gray-900">
                  <span></span>
                  <span className="block plaid-text-animation mt-2">Lumo</span>
                </h1>
                {/* AAC Interface States */}
                <div className="mt-10">
                  {/* Idle State */}
                  {state === "idle" && (
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                      <Button
                        onClick={startConversation}
                        size="lg"
                        className="shine-hover rounded-2xl px-10 py-5 text-xl font-semibold border border-white/30 bg-blue-600/60 hover:bg-blue-600/70 text-white backdrop-blur-lg backdrop-saturate-150 shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-blue-300/40 transform hover:scale-105"
                      >
                        Start Conversation
                      </Button>
                      <p className="text-white/80 text-center text-lg sm:self-center">
                        Press Enter or click to begin
                      </p>
                    </div>
                  )}

                  {/* Listening State */}
                  {state === "listening" && (
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping"></div>
                        <div className="absolute inset-4 bg-green-500/50 rounded-full animate-pulse"></div>
                        <div className="absolute inset-8 bg-green-500/70 rounded-full"></div>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Listening...
                      </h2>
                      <p className="text-white/80 text-lg">
                        Observing your gestures and expressions
                      </p>
                    </div>
                  )}

                  {/* Processing State */}
                  {state === "processing" && (
                    <div className="text-center">
                      <div className="flex justify-center space-x-2 mb-6">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-4 h-4 bg-yellow-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Processing input...
                      </h2>
                      <p className="text-white/80 text-lg">
                        AI is analyzing your communication
                      </p>
                    </div>
                  )}

                  {/* Suggesting State */}
                  {state === "suggesting" && (
                    <div className="w-full max-w-4xl mx-auto">
                      <h2 className="text-3xl font-bold text-white mb-8 text-center">
                        What would you like to say?
                      </h2>
                      <div className="grid md:grid-cols-3 gap-6">
                        {mockSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 shadow-lg p-6 hover:bg-white/40 transition-all duration-300 hover:scale-105"
                          >
                            <p className="text-xl font-semibold text-gray-900 mb-4 min-h-[3rem] flex items-center justify-center text-center">
                              {suggestion}
                            </p>
                            <Button
                              onClick={() => selectSuggestion(suggestion)}
                              className="w-full shine-hover rounded-xl px-6 py-3 text-lg font-semibold border border-white/30 bg-green-600/60 hover:bg-green-600/70 text-white backdrop-blur-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                            >
                              Select ({index + 1})
                            </Button>
                          </div>
                        ))}
                      </div>
                      <p className="text-white/80 mt-6 text-center text-lg">
                        Press number keys 1-3 or click to select
                      </p>
                    </div>
                  )}

                  {/* Selected feedback overlay */}
                  {selectedSuggestion && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600/90 backdrop-blur-lg rounded-2xl px-8 py-4 border border-green-400/50 shadow-2xl z-50">
                      <p className="text-white text-xl font-semibold">
                        Speaking: "{selectedSuggestion}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
