 "use client";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { t } from "@/utils/i18n";

export default function AstigmatismTest() {
  const language = useVisionStore((s) => s.language);
  const setStep = useVisionStore((s) => s.setStep);
  const setAstigmatism = useVisionStore((s) => s.setAstigmatism);

  const handleResponse = (uneven: boolean) => {
    setAstigmatism(uneven);
    setStep("contrast");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          {t(language, "astig.badge")}
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">{t(language, "astig.title")}</h2>
        <p className="text-zinc-600 font-medium bg-zinc-100 py-2 px-4 rounded-lg inline-block">
          {t(language, "astig.look")}
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-zinc-100 rounded-xl p-8 flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-64 sm:h-64">
          {[...Array(72)].map((_, i) => (
            <g key={i} transform={`rotate(${i * 5} 100 100)`}>
              <line
                x1="100"
                y1="20"
                x2="100"
                y2="180"
                stroke="black"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <p className="text-zinc-700 font-medium">
          {t(language, "astig.question")}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResponse(true)}
            className="py-3 px-6 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl font-medium transition-colors"
          >
            {t(language, "astig.yes")}
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t(language, "astig.no")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
