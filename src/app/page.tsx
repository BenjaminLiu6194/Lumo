// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CMUFuturisticBackground } from "@/components/ui/CMUFuturisticBackground";
import { ConversationCamera } from "@/components/ConversationCamera";
import { AudioResponsiveBall } from "@/components/AudioResponsiveBall";

type AppState = "idle" | "camera" | "listening" | "processing" | "suggesting";

// Nut allergy communication suggestions
const mockSuggestions = [
  { text: "I have a severe nut allergy", tone: "Important safety alert" },
  { text: "Which dishes contain nuts or nut oils?", tone: "Safety inquiry" },
  { text: "Can this be prepared without any nuts?", tone: "Accommodation request" },
];

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [userMessage, setUserMessage] = useState("");

  // Speech synthesis function with completion callback
  const speakText = (text: string, onComplete?: () => void) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.volume = 0.8;

      // Add event listener for when speech ends
      utterance.onend = () => {
        if (onComplete) {
          onComplete();
        }
      };

      speechSynthesis.speak(utterance);
    } else {
      // Fallback if speech synthesis is not available
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2000);
    }
  }; // Start conversation flow
  const startConversation = () => {
    // Go directly to camera state without morphing
    setState("camera");
  };

  // End conversation and start analysis automatically
  const endConversation = () => {
    // Move directly to listening state (ball is already visible)
    setState("listening");

    // Show "Analyzing conversation..." for 3 seconds
    setTimeout(() => {
      setState("processing");

      // Show "Processing facial expression..." for 2 seconds
      setTimeout(() => {
        setState("suggesting");
      }, 2000);
    }, 3000);
  };

  // Return to idle state
  const returnToIdle = () => {
    setState("idle");
    setSelectedSuggestion(null);
    setIsSpeaking(false);
    setUserMessage("");
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setIsSpeaking(true);

    // Speak the text and wait for completion
    speakText(suggestion, () => {
      // Audio finished, clear selected suggestion but stay on suggestions page
      setTimeout(() => {
        setSelectedSuggestion(null);
        setIsSpeaking(false);
      }, 500); // Small delay after audio completes
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (state === "idle" && e.key === "Enter") {
        startConversation();
      } else if (state === "camera" && e.key === "Escape") {
        endConversation();
      } else if (state === "suggesting") {
        if (e.key === "1") selectSuggestion(mockSuggestions[0].text);
        if (e.key === "2") selectSuggestion(mockSuggestions[1].text);
        if (e.key === "3") selectSuggestion(mockSuggestions[2].text);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state]);
  return (
    <div
      className="relative w-full min-h-screen"
      style={{
        filter: `brightness(${brightness}%) saturate(${saturation}%)`,
      }}
    >
      <CMUFuturisticBackground />

      {/* Home Logo Button */}
      <button
        onClick={returnToIdle}
        className="home-logo"
        aria-label="Return to home"
      >
        <img src="/favicon.png" alt="Lumo Logo" />
      </button>

      {/* Accessibility Panel */}
      <div className="accessibility-panel">
        <div className="accessibility-toggle">
          {/* Brightness Icon */}
          <svg
            className="accessibility-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="vertical-slider"
            aria-label="Brightness control"
          />
          <span className="slider-label">Bright</span>
        </div>

        <div className="accessibility-toggle">
          {/* Saturation Icon */}
          <svg
            className="accessibility-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <input
            type="range"
            min="50"
            max="150"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="vertical-slider"
            aria-label="Saturation control"
          />
          <span className="slider-label">Color</span>
        </div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Hero area with enhanced padding from background */}
        <section
          className={`relative flex-grow text-center flex items-center justify-center min-h-screen ${
            state === "camera" ||
            state === "listening" ||
            state === "processing"
              ? "pt-8 pb-8"
              : "pt-12 pb-12"
          }`}
        >
          <div className="w-full max-w-screen-xl mx-auto relative z-10 px-6 py-6 md:px-12 md:py-10">
            <div className="animate-fade-in-up">
              {/* Enhanced margins for more breathing room from background */}
              <div
                className={`mx-6 sm:mx-12 md:mx-16 bg-white/40 backdrop-blur-lg rounded-[3rem] border border-white/50 shadow-2xl ${
                  state === "camera" || state === "listening"
                    ? "pt-6 px-4 pb-4 md:pt-8 md:px-6 md:pb-6" // More top padding to position ball higher
                    : state === "processing" || state === "suggesting"
                    ? "p-8 md:p-12 lg:p-16" // Enhanced spacing for processing and suggesting states
                    : "p-10 md:p-16 lg:p-20"
                }`}
              >
                {/* LUMO Title - hidden during active states */}
                {state === "idle" && (
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight relative text-gray-900 animate-delayed-fade-in">
                    <span></span>
                    <span className="block plaid-text-animation cursive-ligature-animation mt-2">
                      Lumo
                    </span>
                  </h1>
                )}

                {/* Audio-responsive ball during camera/listening/processing/suggesting/speaking */}
                {(state === "camera" ||
                  state === "listening" ||
                  state === "processing" ||
                  state === "suggesting" ||
                  isSpeaking) && (
                  <div className="animate-ball-fade-in mb-8 flex flex-col items-center justify-center min-h-[120px]">
                    {/* Text above the ball based on state */}
                    {state === "camera" && (
                      <p className="text-white text-xl md:text-2xl font-medium mb-4 animate-fade-in">
                        Listening...
                      </p>
                    )}
                    {state === "suggesting" && (
                      <p className="text-white text-xl md:text-2xl font-medium mb-4 animate-fade-in">
                        Choose your response
                      </p>
                    )}
                    <AudioResponsiveBall
                      isListening={state === "camera"}
                      isSpeaking={isSpeaking}
                      isVisible={true}
                    />
                  </div>
                )}
                {/* AAC Interface States */}
                <div
                  className={`${
                    state === "camera" || state === "listening"
                      ? "mt-6" // Enhanced spacing between ball and camera
                      : state === "processing"
                      ? "mt-2"
                      : "mt-8"
                  }`}
                >
                  {/* Idle State */}
                  {state === "idle" && (
                    <div className="text-center animate-extra-slow-fade-in py-4">
                      <Button
                        onClick={startConversation}
                        size="lg"
                        className="shine-hover rounded-2xl px-12 py-6 text-xl md:text-2xl font-semibold border border-white/30 bg-blue-600/60 hover:bg-blue-600/70 text-white backdrop-blur-lg backdrop-saturate-150 shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-blue-300/40 transform hover:scale-105"
                      >
                        Start Conversation
                      </Button>
                      <p className="text-white/80 mt-6 text-lg md:text-xl">
                        Press Enter or click to begin
                      </p>
                    </div>
                  )}

                  {/* Camera State */}
                  {state === "camera" && (
                    <div className="animate-fade-in">
                      <ConversationCamera
                        onEndConversation={endConversation}
                        userMessage={userMessage}
                        onMessageChange={setUserMessage}
                      />
                    </div>
                  )}

                  {/* Listening State - Analyzing Conversation */}
                  {state === "listening" && (
                    <div className="text-center py-6">
                      <div className="flex justify-center space-x-3 mb-8">
                        <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-5 h-5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-5 h-5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Analyzing Conversation
                      </h2>
                      <p className="text-white/80 text-lg md:text-xl max-w-md mx-auto">
                        Processing your recorded expressions and gestures
                      </p>
                    </div>
                  )}

                  {/* Processing State - Facial Expression Analysis */}
                  {state === "processing" && (
                    <div className="text-center py-6">
                      <div className="flex justify-center space-x-3 mb-8">
                        <div className="w-5 h-5 bg-purple-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-5 h-5 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-5 h-5 bg-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Facial Expression
                      </h2>
                      <p className="text-white/80 text-lg md:text-xl max-w-md mx-auto">
                        Analyzing facial expressions and micro-gestures
                      </p>
                    </div>
                  )}

                  {/* Suggesting State */}
                  {state === "suggesting" && (
                    <div className="w-full max-w-5xl mx-auto animate-suggestions-delayed-fade-in py-4">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
                        What would you like to say?
                      </h2>
                      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
                        {mockSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => selectSuggestion(suggestion.text)}
                            className={`suggestion-button-${
                              index + 1
                            } backdrop-blur-md rounded-2xl border shadow-lg p-8 transition-all duration-300 hover:scale-105 animate-suggestion-card-${
                              index + 1
                            } cursor-pointer text-left w-full`}
                          >
                            <div className="min-h-[5rem] flex flex-col items-center justify-center">
                              <p className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 text-center leading-relaxed">
                                {suggestion.text}
                              </p>
                              <p className="text-sm md:text-base text-white font-medium text-center opacity-80">
                                {suggestion.tone}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Restart Conversation Button */}
                      <div className="mt-12 text-center">
                        <Button
                          onClick={startConversation}
                          size="lg"
                          className="shine-hover rounded-2xl px-12 py-6 text-xl md:text-2xl font-semibold border border-white/30 bg-blue-600/60 hover:bg-blue-600/70 text-white backdrop-blur-lg backdrop-saturate-150 shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-blue-300/40 transform hover:scale-105"
                        >
                          Restart Conversation
                        </Button>
                      </div>
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
