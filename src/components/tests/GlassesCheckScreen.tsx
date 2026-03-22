 "use client";
import { Glasses } from "lucide-react";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { t } from "@/utils/i18n";

export default function GlassesCheckScreen() {
  const language = useVisionStore((s) => s.language);
  const setStep = useVisionStore((s) => s.setStep);
  const setWearsGlasses = useVisionStore((s) => s.setWearsGlasses);

  const handleSelection = (wears: boolean) => {
    setWearsGlasses(wears);
    setStep('acuity_left_without'); // Start first test
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="bg-zinc-100 p-6 rounded-full">
        <Glasses className="w-12 h-12 text-zinc-700" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900">{t(language, "glasses.title")}</h2>
        <p className="text-zinc-600 max-w-sm mx-auto">
          {t(language, "glasses.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => handleSelection(true)}
          className="flex items-center justify-center gap-2 p-4 border-2 border-zinc-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-zinc-800"
        >
          {t(language, "glasses.yes")}
        </button>
        <button
          onClick={() => handleSelection(false)}
          className="flex items-center justify-center gap-2 p-4 border-2 border-zinc-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-zinc-800"
        >
          {t(language, "glasses.no")}
        </button>
      </div>
    </motion.div>
  );
}
