"use client";
import { useVisionStore } from "@/store/useVisionStore";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { t, getHabits, strainLevelLabel } from "@/utils/i18n";
import AgeVisionChart from "@/components/charts/AgeVisionChart";

export default function ResultsScreen() {
  const language = useVisionStore((s) => s.language);
  const state = useVisionStore();

  // Logic Analysis
  let urgencyLevel: "Normal" | "Monitor" | "Attention" | "Urgent" = "Normal";
  const detectedIssues: string[] = [];
  const recommendations: string[] = getHabits(language).slice(0, 3);

  // 1. Amsler Grid (Urgent)
  if (state.amslerDistorted) {
    urgencyLevel = "Urgent";
    detectedIssues.push(t(language, "results.issues.retinal"));
  }

  // 2. Acuity Check
  const leftMax = Math.max(
    state.acuityLeftWithout ?? 0,
    state.acuityLeftWith ?? 0,
  );
  const rightMax = Math.max(
    state.acuityRightWithout ?? 0,
    state.acuityRightWith ?? 0,
  );

  if (leftMax < 5 || rightMax < 5) {
    detectedIssues.push(t(language, "results.issues.distance"));
    if (urgencyLevel === "Normal") urgencyLevel = "Attention";
  }
  if (Math.abs(leftMax - rightMax) >= 2) {
    detectedIssues.push(t(language, "results.issues.difference"));
    if (urgencyLevel === "Normal") urgencyLevel = "Monitor";
  }

  // 3. Astigmatism
  if (state.astigmatism) {
    detectedIssues.push(t(language, "results.issues.astigmatism"));
    if (urgencyLevel === "Normal") urgencyLevel = "Attention";
  }

  // 4. Contrast
  if ((state.contrastSensitivity ?? 0) < 3) {
    detectedIssues.push(t(language, "results.issues.contrast"));
    if (urgencyLevel === "Normal") urgencyLevel = "Monitor";
  }

  // 5. Eye Strain
  const strain = state.strainScore ?? 0;
  let strainLevel = "Low";
  if (strain === 2) {
    strainLevel = "Medium";
    if (urgencyLevel === "Normal") urgencyLevel = "Monitor";
    recommendations.push(
      "Reduce screen brightness and consider blue light filters.",
    );
  } else if (strain > 2) {
    strainLevel = "High";
    detectedIssues.push(t(language, "results.issues.strain_high"));
    if (urgencyLevel === "Normal") urgencyLevel = "Attention";
    recommendations.push(
      "Reduce screen brightness and consider blue light filters.",
    );
    recommendations.push(
      "Blink regularly and stay hydrated to prevent dry eyes.",
    );
  }

  const primaryMessage =
    urgencyLevel === "Normal"
      ? t(language, "results.primary_normal")
      : t(language, "results.primary_changed");

  const age = state.age ?? null;
  const group =
    age == null
      ? null
      : age <= 12
        ? "child"
        : age <= 39
          ? "teen"
          : age <= 60
            ? "mature"
            : "senior";

  const leftMaxScore = Math.max(state.acuityLeftWithout ?? 0, state.acuityLeftWith ?? 0);
  const rightMaxScore = Math.max(state.acuityRightWithout ?? 0, state.acuityRightWith ?? 0);
  const distanceLow = leftMaxScore < 5 || rightMaxScore < 5;

  const myopiaBase =
    (distanceLow ? 60 : 20) +
    (age != null && age <= 39 ? 20 : 0) +
    (age != null && age <= 12 ? 10 : 0) +
    (state.strainScore && state.strainScore > 1 ? 10 : 0);
  const astigBase =
    (state.astigmatism ? 70 : 15) +
    (age != null && age >= 60 ? 10 : 0) +
    (Math.abs(leftMaxScore - rightMaxScore) >= 2 ? 10 : 0);
  const presbyopiaBase =
    (age != null && age >= 40 ? 70 : 10) +
    ((state.strainScore ?? 0) >= 2 ? 10 : 0) +
    ((state.contrastSensitivity ?? 5) < 3 ? 10 : 0);

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const riskData = [
    { label: t(language, "results.risk_labels.myopia"), value: clamp(myopiaBase), color: "#2563eb" },
    { label: t(language, "results.risk_labels.astigmatism"), value: clamp(astigBase), color: "#f59e0b" },
    { label: t(language, "results.risk_labels.presbyopia"), value: clamp(presbyopiaBase), color: "#16a34a" },
  ];

  const renderUrgencyBadge = () => {
    switch (urgencyLevel) {
      case "Urgent":
        return (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-start gap-3 border border-red-200">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">
                {t(language, "results.urgency.urgent_title")}
              </h3>
              <p className="text-red-700 mt-1">
                {t(language, "results.urgency.urgent_desc")}
              </p>
            </div>
          </div>
        );
      case "Attention":
        return (
          <div className="bg-amber-100 text-amber-900 p-4 rounded-xl flex items-start gap-3 border border-amber-200">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">
                {t(language, "results.urgency.attention_title")}
              </h3>
              <p className="text-amber-800 mt-1">
                {t(language, "results.urgency.attention_desc")}
              </p>
            </div>
          </div>
        );
      case "Monitor":
        return (
          <div className="bg-blue-100 text-blue-900 p-4 rounded-xl flex items-start gap-3 border border-blue-200">
            <Info className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">
                {t(language, "results.urgency.monitor_title")}
              </h3>
              <p className="text-blue-800 mt-1">
                {t(language, "results.urgency.monitor_desc")}
              </p>
            </div>
          </div>
        );
      case "Normal":
        return (
          <div className="bg-green-100 text-green-900 p-4 rounded-xl flex items-start gap-3 border border-green-200">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg">
                {t(language, "results.urgency.normal_title")}
              </h3>
              <p className="text-green-800 mt-1">
                {t(language, "results.urgency.normal_desc")}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-zinc-900">
          {t(language, "results.title")}
        </h2>
        <p className="text-xl text-zinc-700 font-medium">{primaryMessage}</p>
      </div>

      <AgeVisionChart title={t(language, "results.risk_section")} data={riskData} />

      {group && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">
            {t(language, "results.age_insights_title")}
          </h3>
          <p className="text-sm text-zinc-700 font-medium">
            {t(language, `results.age_groups.${group}`)}
          </p>
          <p className="text-zinc-700 mt-2">
            {t(language, `results.age_insights.${group}`)}
          </p>
        </div>
      )}

      {renderUrgencyBadge()}

      {detectedIssues.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">
            {t(language, "results.indicators")}
          </h3>
          <ul className="space-y-2">
            {detectedIssues.map((issue, idx) => (
              <li key={idx} className="flex items-center gap-2 text-zinc-700">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                {issue}
              </li>
            ))}
            <li className="flex items-center gap-2 text-zinc-700">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              {t(language, "results.strain_label", {
                level: strainLevelLabel(language, strainLevel as any),
              })}
            </li>
          </ul>
        </div>
      )}

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">
          {t(language, "results.habits_title")}
        </h3>
        <ul className="space-y-3">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-3 text-zinc-700">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-zinc-500 text-center bg-zinc-100 p-4 rounded-lg">
        <strong>{t(language, "results.disclaimer_label")}</strong>{" "}
        {t(language, "results.disclaimer_text")}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={state.reset}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t(language, "results.start_over")}
        </button>
      </div>
    </motion.div>
  );
}
