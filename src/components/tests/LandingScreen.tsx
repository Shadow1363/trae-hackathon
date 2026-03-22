"use client";
import Image from "next/image";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";

export default function LandingScreen() {
  const language = useVisionStore((state) => state.language);
  const setLanguage = useVisionStore((state) => state.setLanguage);
  const setStep = useVisionStore((state) => state.setStep);

  const t = {
    en: {
      title: "Eyes Check",
      logoAlt: "Eyes Check logo",
      description:
        "A quick screening to detect possible changes in your vision and help you decide if it's time for a professional eye exam.",
      disclaimerTitle: "Disclaimer:",
      disclaimerText:
        "This app is not a medical diagnosis tool. Results are approximate and may be affected by screen size, resolution, and testing conditions. For accurate evaluation, consult an eye care professional.",
      start: "Start Check",
      langLabel: "Language",
      en: "English",
      pt: "Português",
    },
    pt: {
      title: "Eyes Check",
      logoAlt: "Logotipo Eyes Check",
      description:
        "Uma triagem rápida para detectar possíveis mudanças na sua visão e ajudar a decidir se é hora de um exame profissional.",
      disclaimerTitle: "Aviso:",
      disclaimerText:
        "Este app não é uma ferramenta de diagnóstico médico. Os resultados são aproximados e podem ser afetados pelo tamanho da tela, resolução e condições do teste. Para avaliação precisa, consulte um profissional de saúde ocular.",
      start: "Iniciar Avaliação",
      langLabel: "Idioma",
      en: "Inglês",
      pt: "Português",
    },
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="w-full flex justify-end">
        <div
          role="group"
          aria-label={t[language].langLabel}
          className="bg-zinc-100 rounded-full p-1 flex gap-1"
        >
          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-pressed={language === "en"}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              language === "en"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {t[language].en}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("pt")}
            aria-pressed={language === "pt"}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              language === "pt"
                ? "bg-white text-zinc-900 shadow"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {t[language].pt}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Image
          src="/eyes_check_blue_transparent.png"
          alt={t[language].logoAlt}
          width={600}
          height={370}
          priority
          className="w-[280px] sm:w-[360px] md:w-[420px] h-auto"
        />
      </div>

      <div className="space-y-4">
        <p className="text-zinc-600 max-w-md mx-auto leading-relaxed">
          {t[language].description}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-left flex gap-4 max-w-lg">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          <strong>{t[language].disclaimerTitle}</strong>{" "}
          {t[language].disclaimerText}
        </p>
      </div>

      <button
        onClick={() => setStep("age_check")}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition-colors w-full sm:w-auto justify-center"
      >
        {t[language].start}
        <ArrowRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}
