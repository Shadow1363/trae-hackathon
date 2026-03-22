 "use client";
import { useState } from "react";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { t } from "@/utils/i18n";

const CONTRAST_LEVELS = [
  { text: 'C O', opacity: 1 },
  { text: 'H K', opacity: 0.75 },
  { text: 'R Z', opacity: 0.5 },
  { text: 'S N', opacity: 0.25 },
  { text: 'D V', opacity: 0.1 },
  { text: 'P E', opacity: 0.05 },
];

export default function ContrastSensitivityTest() {
  const language = useVisionStore((s) => s.language);
  const setStep = useVisionStore((s) => s.setStep);
  const setContrast = useVisionStore((s) => s.setContrast);
  const [currentLevel, setCurrentLevel] = useState(0);

  const handleResponse = (canRead: boolean) => {
    if (!canRead || currentLevel === CONTRAST_LEVELS.length - 1) {
      const finalLevel = canRead ? currentLevel : Math.max(0, currentLevel - 1);
      setContrast(finalLevel);
      setStep('amsler');
    } else {
      setCurrentLevel((prev) => prev + 1);
    }
  };

  return (
    <motion.div 
      key={currentLevel}
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          {t(language, "contrast.badge")}
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">{t(language, "contrast.title")}</h2>
        <p className="text-zinc-600 font-medium bg-zinc-100 py-2 px-4 rounded-lg inline-block">
          {t(language, "contrast.instruction")}
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-zinc-100 rounded-xl p-12 min-h-[250px] flex items-center justify-center shadow-sm">
        <span 
          className="font-sans text-7xl font-bold text-black transition-opacity duration-500"
          style={{ opacity: CONTRAST_LEVELS[currentLevel].opacity }}
        >
          {CONTRAST_LEVELS[currentLevel].text}
        </span>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <p className="text-zinc-700 font-medium">{t(language, "contrast.question")}</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResponse(true)}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t(language, "contrast.yes")}
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="py-3 px-6 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl font-medium transition-colors"
          >
            {t(language, "contrast.no")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
