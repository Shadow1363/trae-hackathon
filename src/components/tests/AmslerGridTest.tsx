 "use client";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { t } from "@/utils/i18n";

export default function AmslerGridTest() {
  const language = useVisionStore((s) => s.language);
  const setStep = useVisionStore((s) => s.setStep);
  const setAmsler = useVisionStore((s) => s.setAmsler);

  const handleResponse = (distorted: boolean) => {
    setAmsler(distorted);
    setStep("questionnaire");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          {t(language, "amsler.badge")}
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">{t(language, "amsler.title")}</h2>
        <p className="text-zinc-600 font-medium bg-zinc-100 py-2 px-4 rounded-lg inline-block">
          {t(language, "amsler.instruction")}
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-zinc-100 rounded-xl p-8 flex items-center justify-center shadow-sm">
        <div
          className="relative w-64 h-64 border-2 border-black"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <p className="text-zinc-700 font-medium">{t(language, "amsler.question")}</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleResponse(true)}
            className="py-3 px-6 bg-red-100 hover:bg-red-200 text-red-800 border border-red-200 rounded-xl font-medium transition-colors"
          >
            {t(language, "amsler.yes")}
          </button>
          <button
            onClick={() => handleResponse(false)}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t(language, "amsler.no")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
