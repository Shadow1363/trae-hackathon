 "use client";
import { useState } from "react";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import { t, getQuestions } from "@/utils/i18n";

const QUESTIONS_EN = [
  "Do you squint often?",
  "Do you get headaches after screen use?",
  "Is your vision blurry at night?",
  "Do you adjust distance to see clearly?",
];

export default function QuestionnaireScreen() {
  const language = useVisionStore((s) => s.language);
  const setStep = useVisionStore((s) => s.setStep);
  const setStrainScore = useVisionStore((s) => s.setStrainScore);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers, answer];
    const questions = language === "pt" ? getQuestions(language) : QUESTIONS_EN;
    if (newAnswers.length === questions.length) {
      // Calculate score (number of 'Yes' answers)
      const score = newAnswers.filter(Boolean).length;
      setStrainScore(score);
      setStep('results');
    } else {
      setAnswers(newAnswers);
    }
  };

  const currentQuestionIndex = answers.length;
  const questions = language === "pt" ? getQuestions(language) : QUESTIONS_EN;

  return (
    <motion.div 
      key={currentQuestionIndex}
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-center text-center space-y-8"
    >
      <div className="space-y-2">
        <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
          {t(language, "questionnaire.badge")}
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">{t(language, "questionnaire.title")}</h2>
        <p className="text-zinc-600 font-medium bg-zinc-100 py-2 px-4 rounded-lg inline-block">
          {t(language, "questionnaire.progress", { n: currentQuestionIndex + 1, total: questions.length })}
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-2 border-zinc-100 rounded-xl p-10 flex items-center justify-center shadow-sm min-h-[200px]">
        <h3 className="text-xl font-medium text-zinc-800 leading-relaxed">
          {questions[currentQuestionIndex]}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={() => handleAnswer(true)}
          className="py-4 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-medium transition-colors"
        >
          {t(language, "questionnaire.yes")}
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="py-4 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-medium transition-colors"
        >
          {t(language, "questionnaire.no")}
        </button>
      </div>
    </motion.div>
  );
}
