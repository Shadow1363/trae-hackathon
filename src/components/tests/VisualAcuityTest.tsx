"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
      const chosenLetter =
        availableLetters[randomIndex] ?? SNELLEN_LETTERS[0] ?? "E";

      text += chosenLetter + (i < count - 1 ? " " : "");
      lastLetter = chosenLetter;
    }
    return { text, size };
  });
};

let globalAudioCtx: AudioContext | null = null;
const getAudioContextCtor = () => {
  const w = window as Window & { webkitAudioContext?: typeof AudioContext };
  return window.AudioContext ?? w.webkitAudioContext;
};

const playBeep = (
  freq = 440,
  duration = 0.1,
  type: OscillatorType = "sine",
) => {
  try {
    const Context = getAudioContextCtor();
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

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};

type SpeechRecognitionAlternativeLike = { transcript?: string };
type SpeechRecognitionResultLike = {
  [alternativeIndex: number]: SpeechRecognitionAlternativeLike;
};
type SpeechRecognitionResultListLike = {
  length: number;
  [resultIndex: number]: SpeechRecognitionResultLike | undefined;
};
type SpeechRecognitionEventLike = { results: SpeechRecognitionResultListLike };

const getSpeechRecognitionCtor = () => {
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export default function VisualAcuityTest() {
  const { currentStep, wearsGlasses, setStep, setAcuity, language } =
    useVisionStore();
  const [currentLine, setCurrentLine] = useState(0);

  const [testState, setTestState] = useState<
    "hidden" | "countdown" | "showing"
  >("hidden");
  const [snellenLines, setSnellenLines] = useState(() => generateRandomLines());
  const [countdown, setCountdown] = useState(10);
  const [spokenText, setSpokenText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() =>
    typeof window !== "undefined" ? !!getSpeechRecognitionCtor() : true,
  );
  const [speechErrorMsg, setSpeechErrorMsg] = useState<string | null>(null);

  // Reference to hold the reset timeout
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseLockedRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recognitionRunningRef = useRef(false);
  const shouldListenRef = useRef(false);
  const currentLineRef = useRef(currentLine);
  const snellenLinesRef = useRef(snellenLines);
  const testStateRef = useRef(testState);
  const speechErrorMsgRef = useRef(speechErrorMsg);
  const languageRef = useRef(language);
  const currentStepRef = useRef(currentStep);

  // Determine current context based on step
  const isLeftEye = currentStep.includes("left");
  const isWithGlasses = currentStep.includes("_with");

  const handleResponse = useCallback(
    (canRead: boolean) => {
      if (responseLockedRef.current) return;
      responseLockedRef.current = true;
      setTimeout(() => {
        responseLockedRef.current = false;
      }, 800);

      const lineIndex = currentLineRef.current;
      const totalLines = snellenLinesRef.current.length;
      if (!canRead || lineIndex >= totalLines - 1) {
        const finalLine = canRead ? lineIndex : Math.max(0, lineIndex - 1);

        const step = currentStepRef.current;
        const eye = step.includes("left") ? "left" : "right";
        const condition = step.includes("_with") ? "with" : "without";
        setAcuity(eye, condition, finalLine);

        let nextStep: Step = "astigmatism";

        if (step === "acuity_left_without") {
          nextStep = "acuity_right_without";
        } else if (step === "acuity_right_without") {
          nextStep = wearsGlasses ? "acuity_left_with" : "astigmatism";
        } else if (step === "acuity_left_with") {
          nextStep = "acuity_right_with";
        } else if (step === "acuity_right_with") {
          nextStep = "astigmatism";
        }

        setStep(nextStep);
        setCurrentLine(0);
        setTestState("hidden");
        setSpokenText("");
      } else {
        setCurrentLine((prev) => prev + 1);
        setSpokenText("");
      }
    },
    [setAcuity, setStep, wearsGlasses],
  );

  useEffect(() => {
    currentLineRef.current = currentLine;
  }, [currentLine]);

  useEffect(() => {
    snellenLinesRef.current = snellenLines;
  }, [snellenLines]);

  useEffect(() => {
    testStateRef.current = testState;
  }, [testState]);

  useEffect(() => {
    speechErrorMsgRef.current = speechErrorMsg;
  }, [speechErrorMsg]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (testState === "countdown") {
      if (countdown > 0) {
        playBeep(440, 0.1);
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        playBeep(880, 0.3); // higher beep for start
        const timer = setTimeout(() => setTestState("showing"), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [testState, countdown]);

  useEffect(() => {
    if (!speechSupported) return;

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) return;

    const stripDiacritics = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const normalizeTranscriptInput = (
      transcript: string,
      lang: "en" | "pt",
    ) => {
      const tokens = stripDiacritics(transcript).match(/[a-z]+/g) || [];
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

    const recognition = new SpeechRecognitionCtor() as SpeechRecognitionLike;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageRef.current === "pt" ? "pt-BR" : "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: unknown) => {
      if (responseLockedRef.current) return;
      if (testStateRef.current !== "showing") return;

      const results = (event as Partial<SpeechRecognitionEventLike>).results;
      const parts: string[] = [];
      if (results && typeof results.length === "number") {
        for (let i = 0; i < results.length; i++) {
          const alt = results[i]?.[0];
          const t = typeof alt?.transcript === "string" ? alt.transcript : "";
          if (t) parts.push(t);
        }
      }
      const currentTranscript = parts.join(" ").trim();
      if (!currentTranscript) return;

      if (currentTranscript.length > 60) {
        setSpokenText("");
        try {
          recognition.abort?.();
        } catch {
          try {
            recognition.stop();
          } catch {
            // ignore
          }
        }
        return;
      }

      const lineIndex = currentLineRef.current;
      const expectedRaw = snellenLinesRef.current[lineIndex]?.text ?? "";
      const expected = expectedRaw.toLowerCase().replace(/\s+/g, "");
      if (!expected) return;

      setSpokenText(currentTranscript);

      const normalizedTranscript = normalizeTranscriptInput(
        currentTranscript,
        languageRef.current === "pt" ? "pt" : "en",
      );

      if (normalizedTranscript.includes(expected)) {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        playSuccessSound();
        handleResponse(true);
        return;
      }

      const stopWords = [
        "blurry",
        "cantsee",
        "cannotsee",
        "stop",
        "embacado",
        "borrado",
        "naoconsigover",
        "naover",
        "pare",
      ];
      if (stopWords.some((w) => normalizedTranscript.includes(w))) {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        handleResponse(false);
        return;
      }

      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        if (testStateRef.current !== "showing") return;
        playErrorSound();
        setSpokenText("");
        try {
          recognition.abort?.();
        } catch {
          try {
            recognition.stop();
          } catch {
            // ignore
          }
        }
      }, 3000);
    };

    recognition.onerror = (event: unknown) => {
      const error =
        typeof event === "object" && event && "error" in event
          ? (event as { error?: unknown }).error
          : undefined;
      if (error === "network") {
        setSpeechErrorMsg(
          "Voice unavailable in this browser preview. Open in full Google Chrome.",
        );
        setIsListening(false);
        return;
      }
      if (error === "not-allowed" || error === "service-not-allowed") {
        setSpeechErrorMsg("Microphone access denied.");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      recognitionRunningRef.current = false;
      setIsListening(false);

      if (!shouldListenRef.current) return;
      if (speechErrorMsgRef.current) return;

      const lineIndex = currentLineRef.current;
      const hasExpected = !!snellenLinesRef.current[lineIndex]?.text;
      if (!hasExpected) return;

      setTimeout(() => {
        if (!shouldListenRef.current) return;
        if (recognitionRunningRef.current) return;
        try {
          recognition.start();
          recognitionRunningRef.current = true;
          setIsListening(true);
        } catch {
          // ignore
        }
      }, 150);
    };

    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      shouldListenRef.current = false;
      recognitionRunningRef.current = false;
      try {
        recognition.abort?.();
      } catch {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognitionRef.current = null;
    };
  }, [speechSupported, handleResponse]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.lang = language === "pt" ? "pt-BR" : "en-US";
  }, [language]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    const shouldListen = testState === "showing" && !speechErrorMsg;
    shouldListenRef.current = shouldListen;

    if (!shouldListen) {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      try {
        recognition.abort?.();
      } catch {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
      recognitionRunningRef.current = false;
      setTimeout(() => {
        setIsListening(false);
        setSpokenText("");
      }, 0);
      return;
    }

    if (recognitionRunningRef.current) return;
    try {
      recognition.start();
      recognitionRunningRef.current = true;
      setTimeout(() => setIsListening(true), 0);
    } catch {
      // ignore
    }
  }, [testState, speechErrorMsg]);

  const startTest = () => {
    // Initialize audio context on user interaction
    const Context = getAudioContextCtor();
    if (Context && !globalAudioCtx) {
      globalAudioCtx = new Context();
    }
    setSnellenLines(generateRandomLines());
    setCurrentLine(0);
    setSpokenText("");
    responseLockedRef.current = false;
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
