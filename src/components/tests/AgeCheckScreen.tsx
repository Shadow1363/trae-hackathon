 "use client";
import { useState } from "react";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { t } from "@/utils/i18n";

export default function AgeCheckScreen() {
  const language = useVisionStore((s) => s.language);
  const setStep = useVisionStore((s) => s.setStep);
  const setAge = useVisionStore((s) => s.setAge);
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(inputValue, 10);
    if (!isNaN(ageNum) && ageNum > 0 && ageNum < 120) {
      setAge(ageNum);
      setStep('glasses_check');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8 max-w-md mx-auto"
    >
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900">{t(language, "age.title")}</h2>
        <p className="text-zinc-600">
          {t(language, "age.description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-6">
        <input
          type="number"
          min="1"
          max="120"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t(language, "age.placeholder")}
          className="text-center text-3xl font-bold text-blue-600 py-4 px-6 border-2 border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all w-32"
          autoFocus
        />

        <button
          type="submit"
          disabled={!inputValue || parseInt(inputValue, 10) <= 0 || parseInt(inputValue, 10) >= 120}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:text-zinc-500 text-white rounded-xl font-semibold transition-colors shadow-sm"
        >
          {t(language, "age.continue")}
        </button>
      </form>
    </motion.div>
  );
}
