"use client";
import { useState, useEffect, useRef } from "react";
import { useVisionStore, Step } from "@/store/useVisionStore";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

const SNELLEN_LETTERS = ["C", "D", "E", "F", "L", "O", "P", "T", "Z"];

const LINE_SIZES = [
  { count: 1, size: "text-8xl" },
  { count: 2, size: "text-7xl" },
  { count: 3, size: "text-6xl" },
  { count: 4, size: "text-5xl" },
  { count: 5, size: "text-4xl" },
  { count: 6, size: "text-3xl" },
  { count: 7, size: "text-2xl" },
  { count: 8, size: "text-xl" },
];

// Generate randomized lines so the user can't memorize them
const generateRandomLines = () => {
  return LINE_SIZES.map(({ count, size }) => {
    let text = "";
    let lastLetter = "";

    for (let i = 0; i < count; i++) {
      // Filter out the last letter so it doesn't repeat consecutively
      const availableLetters = SNELLEN_LETTERS.filter(
        (letter) => letter !== lastLetter,
      );
      const randomIndex = Math.floor(Math.random() * availableLetters.length);
      const chosenLetter = availableLetters[randomIndex];

      text += chosenLetter + (i < count - 1 ? " " : "");
      lastLetter = chosenLetter;
    }
    return { text, size };
  });
};

let globalAudioCtx: AudioContext | null = null;
const playBeep = (
  freq = 440,
  duration = 0.1,
  type: OscillatorType = "sine",
) => {
  try {
    const Context = window.AudioContext || (window as any).webkitAudioContext;
    if (!Context) return;
    if (!globalAudioCtx) {
      globalAudioCtx = new Context();
    }
    const osc = globalAudioCtx.createOscillator();
    const gainNode = globalAudioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, globalAudioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, globalAudioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      globalAudioCtx.currentTime + duration,
    );

    osc.connect(gainNode);
    gainNode.connect(globalAudioCtx.destination);

    osc.start();
    osc.stop(globalAudioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const playErrorSound = () => {
  playBeep(200, 0.2, "sawtooth");
  setTimeout(() => playBeep(150, 0.3, "sawtooth"), 150);
};

const playSuccessSound = () => {
  playBeep(600, 0.1, "sine");
  setTimeout(() => playBeep(800, 0.2, "sine"), 100);
};

export default function VisualAcuityTest() {
  const { currentStep, wearsGlasses, setStep, setAcuity, language } =
    useVisionStore();
  const [currentLine, setCurrentLine] = useState(0);

  const [testState, setTestState] = useState<
    "hidden" | "countdown" | "showing"
  >("hidden");
  const [snellenLines, setSnellenLines] = useState(generateRandomLines());
  const [countdown, setCountdown] = useState(10);
  const [spokenText, setSpokenText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechErrorMsg, setSpeechErrorMsg] = useState<string | null>(null);

  // Reference to hold the reset timeout
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine current context based on step
  const isLeftEye = currentStep.includes("left");
  const isWithGlasses = currentStep.includes("_with");

  useEffect(() => {
    setSpeechSupported(
      !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      ),
    );
  }, []);

  useEffect(() => {
    if (testState === "countdown") {
      if (countdown > 0) {
        playBeep(440, 0.1);
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        playBeep(880, 0.3); // higher beep for start
        setTestState("showing");
      }
    }
  }, [testState, countdown]);

  useEffect(() => {
    if (testState !== "showing" || !speechSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const normalizeTranscriptInput = (
      transcript: string,
      lang: "en" | "pt",
    ) => {
      const tokens = transcript.toLowerCase().match(/[a-z]+/g) || [];
      const normalizeToken = (t: string) => {
        if (lang === "en") {
          if (/^(tea|tee)$/.test(t)) return "t";
          if (t === "oh") return "o";
          if (/^(zee|zed)$/.test(t)) return "z";
          if (t === "el") return "l";
          if (t === "dee") return "d";
          if (/^(see|sea)$/.test(t)) return "c";
          if (t === "pee") return "p";
          if (t === "ef") return "f";
          if (t === "e") return "e";
          return t;
        } else {
          if (t === "ce") return "c";
          if (t === "de") return "d";
          if (t === "efe") return "f";
          if (t === "ele") return "l";
          if (t === "pe") return "p";
          if (t === "te") return "t";
          if (t === "ze") return "z";
          if (t === "o") return "o";
          if (t === "e") return "e";
          return t;
        }
      };
      return tokens.map(normalizeToken).join("");
    };

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "pt" ? "pt-BR" : "en-US";

    recognition.onresult = (event: any) => {
      const currentTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(" ");

      console.log("🗣️ Raw Transcript Heard:", currentTranscript);

      // If the transcript gets too long, restart the recognition to clear it
      if (currentTranscript.length > 50) {
        console.log("🧹 Transcript too long, clearing...");
        try {
          recognition.stop();
          setSpokenText("");
          return; // The onend handler will automatically restart it
        } catch (e) {
          console.error("Failed to stop for reset", e);
        }
      }

      const expected = snellenLines[currentLine]?.text
        ? snellenLines[currentLine].text.toLowerCase().replace(/\s+/g, "")
        : null;
      console.log("🎯 Expected Text:", expected);

      // If expected is empty, we shouldn't process anything because the line hasn't loaded or we are transitioning
      if (!expected) {
        console.log("⏸️ Skipping match: expected text is empty or undefined");
        return;
      }

      setSpokenText(currentTranscript);

      const normalizedTranscript = normalizeTranscriptInput(
        currentTranscript,
        language === "pt" ? "pt" : "en",
      );

      console.log("🔄 Normalized Transcript:", normalizedTranscript);

      // We need to make sure we don't trigger a match if the expected text is empty (like during transitions)
      if (
        expected &&
        expected.length > 0 &&
        normalizedTranscript.includes(expected)
      ) {
        console.log("✅ Match! Advancing to next line.");
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        playSuccessSound();
        handleResponse(true);
      } else if (
        normalizedTranscript.includes("blurry") ||
        normalizedTranscript.includes("cantsee") ||
        normalizedTranscript.includes("cannotsee") ||
        normalizedTranscript.includes("stop") ||
        normalizedTranscript.includes("embacado") || // embaçado (accents removed)
        normalizedTranscript.includes("borrado") ||
        normalizedTranscript.includes("naoconsigover") ||
        normalizedTranscript.includes("naover") ||
        normalizedTranscript.includes("pare")
      ) {
        console.log("🛑 User said blurry/stop. Ending this eye test.");
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        handleResponse(false);
      } else {
        console.log("❌ No match yet. Keep trying.");
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }
        resetTimeoutRef.current = setTimeout(() => {
          if (testState === "showing") {
            console.log(
              "⏱️ 2 seconds passed with no match. Resetting transcript.",
            );
            playErrorSound();
            try {
              recognition.stop();
              setSpokenText("");
            } catch (e) {
              console.error(e);
            }
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("🎤 Speech Recognition Error:", event.error);
      if (event.error === "network") {
        setSpeechErrorMsg(
          "Voice unavailable in this browser preview. Open in full Google Chrome.",
        );
        setIsListening(false);
      } else if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setSpeechErrorMsg("Microphone access denied.");
        setIsListening(false);
      }
    };

    let shouldRestart = true;

    recognition.onend = () => {
      console.log(
        "🎤 Speech Recognition Ended. Is listening supposed to be active?",
        isListening,
      );
      // Automatically restart if we are still showing the test, didn't manually stop, and no terminal error
      const hasExpected = !!snellenLines[currentLine]?.text;
      if (
        testState === "showing" &&
        hasExpected &&
        shouldRestart &&
        !speechErrorMsg
      ) {
        try {
          console.log("🔄 Restarting Speech Recognition...");
          recognition.start();
        } catch (e) {
          console.error("Failed to restart speech recognition", e);
        }
      }
    };

    try {
      if (!speechErrorMsg) {
        console.log("🚀 Starting Speech Recognition...");
        recognition.start();
        setIsListening(true);
      }
    } catch (e) {
      console.error("Speech recognition start error", e);
    }

    return () => {
      shouldRestart = false;
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setSpokenText("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testState, currentLine, speechSupported, speechErrorMsg]);

  const handleResponse = (canRead: boolean) => {
    if (!canRead || currentLine === snellenLines.length - 1) {
      const finalLine = canRead ? currentLine : Math.max(0, currentLine - 1);

      const eye = isLeftEye ? "left" : "right";
      const condition = isWithGlasses ? "with" : "without";
      setAcuity(eye, condition, finalLine);

      let nextStep: Step = "astigmatism";

      if (currentStep === "acuity_left_without") {
        nextStep = "acuity_right_without";
      } else if (currentStep === "acuity_right_without") {
        nextStep = wearsGlasses ? "acuity_left_with" : "astigmatism";
      } else if (currentStep === "acuity_left_with") {
        nextStep = "acuity_right_with";
      } else if (currentStep === "acuity_right_with") {
        nextStep = "astigmatism";
      }

      setStep(nextStep);
      setCurrentLine(0);
      setTestState("hidden"); // Reset for next eye/condition
    } else {
      setCurrentLine((prev) => prev + 1);
    }
  };

  const startTest = () => {
    // Initialize audio context on user interaction
    const Context = window.AudioContext || (window as any).webkitAudioContext;
    if (Context && !globalAudioCtx) {
      globalAudioCtx = new Context();
    }
    setCountdown(10);
    setTestState("countdown");
  };

  const instructionText =
    language === "pt"
      ? `Fique a 2–3 metros. Cubra o olho ${isLeftEye ? "DIREITO" : "ESQUERDO"}. ${
          isWithGlasses ? "Use seus óculos/lentes." : "Tire os óculos/lentes."
        }`
      : `Stand 2–3 meters away. Cover your ${
          isLeftEye ? "RIGHT" : "LEFT"
        } eye. ${
          isWithGlasses
            ? "Wear your glasses/contacts."
            : "Take OFF your glasses/contacts."
        }`;

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          {language === "pt"
            ? "Teste 1 de 4: Acuidade Visual"
            : "Test 1 of 4: Visual Acuity"}
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">
          {language === "pt"
            ? `Teste do Olho ${isLeftEye ? "Esquerdo" : "Direito"}`
            : `${isLeftEye ? "Left Eye" : "Right Eye"} Test`}
        </h2>
        <p className="text-zinc-600 font-medium bg-zinc-100 py-2 px-4 rounded-lg inline-block">
          {instructionText}
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-zinc-100 rounded-xl p-8 min-h-[280px] flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
        <AnimatePresence mode="wait">
          {testState === "hidden" && (
            <motion.div
              key="hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4"
            >
              <p className="text-zinc-600">
                {language === "pt"
                  ? "As letras estão escondidas no momento."
                  : "Letters are currently hidden."}
              </p>
              <button
                onClick={startTest}
                className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-md"
              >
                {language === "pt"
                  ? "Iniciar contagem de 10s"
                  : "Start 10s Countdown"}
              </button>
              <p className="text-xs text-zinc-500 max-w-xs mt-4">
                {language === "pt"
                  ? "Clique para iniciar a contagem. Dá tempo para ficar a 2–3 metros antes das letras aparecerem."
                  : "Click this button to start a countdown. This gives you time to step 2–3 meters away before the letters appear."}
              </p>
            </motion.div>
          )}

          {testState === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="text-8xl font-bold text-blue-600 mb-4">
                {countdown}
              </div>
              <p className="text-zinc-500 font-medium animate-pulse">
                {language === "pt" ? "Posicione-se..." : "Get in position..."}
              </p>
            </motion.div>
          )}

          {testState === "showing" && (
            <motion.div
              key={`showing-${currentLine}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center w-full"
            >
              <div className="min-h-[150px] flex items-center justify-center w-full">
                {snellenLines[currentLine] && (
                  <span
                    className={`font-serif tracking-widest font-bold ${snellenLines[currentLine].size}`}
                  >
                    {snellenLines[currentLine].text}
                  </span>
                )}
              </div>

              {speechSupported && (
                <div className="mt-8 flex items-center space-x-3 text-zinc-500 bg-zinc-50 px-4 py-2 rounded-full w-full justify-center">
                  {speechErrorMsg ? (
                    <>
                      <MicOff className="w-5 h-5 text-zinc-400" />
                      <span className="text-sm font-medium text-red-500">
                        {speechErrorMsg}
                      </span>
                    </>
                  ) : (
                    <>
                      {isListening ? (
                        <Mic className="w-5 h-5 text-red-500 animate-pulse" />
                      ) : (
                        <MicOff className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {isListening
                          ? spokenText
                            ? language === "pt"
                              ? `Ouvi: "${spokenText}"`
                              : `Heard: "${spokenText}"`
                            : language === "pt"
                              ? "Fale as letras em voz alta..."
                              : "Shout the letters out loud..."
                          : language === "pt"
                            ? "Microfone inativo"
                            : "Microphone inactive"}
                      </span>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`space-y-4 w-full max-w-md transition-opacity duration-300 ${testState === "showing" ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <p className="text-zinc-700 font-medium">
          {speechSupported
            ? language === "pt"
              ? "Fale as letras, ou use os botões abaixo:"
              : "Shout the letters, or use the buttons below:"
            : language === "pt"
              ? "Você consegue ler estas letras claramente?"
              : "Can you read these letters clearly?"}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResponse(true)}
            disabled={testState !== "showing"}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {language === "pt" ? "Sim, claramente" : "Yes, clearly"}
          </button>
          <button
            onClick={() => handleResponse(false)}
            disabled={testState !== "showing"}
            className="py-3 px-6 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {language === "pt" ? "Não, está embaçado" : "No, it's blurry"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
