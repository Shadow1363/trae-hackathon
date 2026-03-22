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

  type ChartBar = { label: string; value: number; color?: string };

  const copy = {
    en: {
      detailsTitle: "Your Test Details",
      acuityChartTitle: "Acuity by Eye",
      scoresChartTitle: "Your Test Scores",
      answersTitle: "Your Answers",
      answersStrain: "Eye strain questionnaire: {yes} yes out of {total}",
      metrics: {
        acuity: "Distance acuity",
        contrast: "Contrast sensitivity",
        strain: "Eye strain",
        amsler: "Amsler grid",
      },
      labels: {
        leftWithout: "Left (no glasses)",
        rightWithout: "Right (no glasses)",
        leftWith: "Left (with glasses)",
        rightWith: "Right (with glasses)",
      },
      values: {
        notTaken: "Not taken",
        yes: "Yes",
        no: "No",
        ok: "OK",
        distorted: "Distorted",
      },
      findingsTitle: "Specific Findings",
      findings: {
        amslerDistorted:
          "Amsler grid distortion detected. Seek an eye care professional promptly.",
        acuityLow:
          "Distance clarity looks reduced on at least one eye in this screening.",
        acuityDiff:
          "There is a noticeable left/right difference in distance clarity.",
        astig:
          "You reported uneven lines on the astigmatism screen, which can be consistent with astigmatism.",
        contrastLow:
          "Contrast sensitivity looks reduced (difficulty with fainter letters).",
        strainHigh:
          "Your answers suggest elevated eye strain symptoms from screens.",
        glassesHelp:
          "Your results look better with glasses/contacts than without.",
      },
    },
    pt: {
      detailsTitle: "Detalhes dos Seus Testes",
      acuityChartTitle: "Acuidade por Olho",
      scoresChartTitle: "Seus Escores",
      answersTitle: "Suas Respostas",
      answersStrain: "Questionário de cansaço ocular: {yes} “sim” de {total}",
      metrics: {
        acuity: "Acuidade à distância",
        contrast: "Sensibilidade ao contraste",
        strain: "Cansaço ocular",
        amsler: "Grade de Amsler",
      },
      labels: {
        leftWithout: "Esquerdo (sem óculos)",
        rightWithout: "Direito (sem óculos)",
        leftWith: "Esquerdo (com óculos)",
        rightWith: "Direito (com óculos)",
      },
      values: {
        notTaken: "Não realizado",
        yes: "Sim",
        no: "Não",
        ok: "OK",
        distorted: "Distorcido",
      },
      findingsTitle: "Achados Específicos",
      findings: {
        amslerDistorted:
          "Distorção na grade de Amsler. Procure um profissional de saúde ocular com prioridade.",
        acuityLow:
          "A nitidez à distância parece reduzida em pelo menos um olho nesta triagem.",
        acuityDiff:
          "Há uma diferença perceptível entre olho esquerdo e direito na nitidez à distância.",
        astig:
          "Você relatou linhas irregulares no teste de astigmatismo, o que pode ser compatível com astigmatismo.",
        contrastLow:
          "A sensibilidade ao contraste parece reduzida (dificuldade com letras mais fracas).",
        strainHigh:
          "Suas respostas sugerem sintomas elevados de cansaço ocular por telas.",
        glassesHelp:
          "Seus resultados parecem melhores com óculos/lentes do que sem.",
      },
    },
  } as const;

  const format = (template: string, params: Record<string, string | number>) =>
    Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
      template,
    );

  // Logic Analysis
  let urgencyLevel: "Normal" | "Monitor" | "Attention" | "Urgent" = "Normal";
  const detectedIssues: string[] = [];
  const recommendations: string[] = getHabits(language).slice(0, 3);

  // 1. Amsler Grid (Urgent)
  if (state.amslerDistorted) {
    urgencyLevel = "Urgent";
    detectedIssues.push(t(language, "results.issues.retinal"));
  }

  const totalAcuityLines = 8;
  const toPercent = (n: number, max: number) =>
    Math.max(0, Math.min(100, Math.round((n / max) * 100)));
  const acuityPercent = (line: number | null) =>
    line == null ? 0 : toPercent(line + 1, totalAcuityLines);

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
  let strainLevel: "Low" | "Medium" | "High" = "Low";
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

  const strainYes = state.strainScore ?? null;
  const strainTotal = 4;

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

  const leftMaxScore = Math.max(
    state.acuityLeftWithout ?? 0,
    state.acuityLeftWith ?? 0,
  );
  const rightMaxScore = Math.max(
    state.acuityRightWithout ?? 0,
    state.acuityRightWith ?? 0,
  );
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
    {
      label: t(language, "results.risk_labels.myopia"),
      value: clamp(myopiaBase),
      color: "#2563eb",
    },
    {
      label: t(language, "results.risk_labels.astigmatism"),
      value: clamp(astigBase),
      color: "#f59e0b",
    },
    {
      label: t(language, "results.risk_labels.presbyopia"),
      value: clamp(presbyopiaBase),
      color: "#16a34a",
    },
  ];

  const acuityBars: ChartBar[] = [
    {
      label: copy[language].labels.leftWithout,
      value: acuityPercent(state.acuityLeftWithout),
      color: "#2563eb",
    },
    {
      label: copy[language].labels.rightWithout,
      value: acuityPercent(state.acuityRightWithout),
      color: "#f59e0b",
    },
  ];
  if (state.wearsGlasses) {
    acuityBars.push(
      {
        label: copy[language].labels.leftWith,
        value: acuityPercent(state.acuityLeftWith),
        color: "#16a34a",
      },
      {
        label: copy[language].labels.rightWith,
        value: acuityPercent(state.acuityRightWith),
        color: "#ef4444",
      },
    );
  }

  const contrastPercent = toPercent((state.contrastSensitivity ?? 0) + 1, 6);
  const strainPercent =
    strainYes == null ? 0 : toPercent(strainYes, strainTotal);
  const amslerPercent = state.amslerDistorted ? 0 : 100;
  const scoreBars: ChartBar[] = [
    {
      label: copy[language].metrics.acuity,
      value: toPercent(
        Math.max(leftMaxScore, rightMaxScore) + 1,
        totalAcuityLines,
      ),
      color: "#2563eb",
    },
    {
      label: copy[language].metrics.contrast,
      value: contrastPercent,
      color: "#f59e0b",
    },
    {
      label: copy[language].metrics.strain,
      value: 100 - strainPercent,
      color: "#16a34a",
    },
    {
      label: copy[language].metrics.amsler,
      value: amslerPercent,
      color: "#ef4444",
    },
  ];

  const specificFindings: string[] = [];
  if (state.amslerDistorted)
    specificFindings.push(copy[language].findings.amslerDistorted);
  if (leftMax < 5 || rightMax < 5)
    specificFindings.push(copy[language].findings.acuityLow);
  if (Math.abs(leftMax - rightMax) >= 2)
    specificFindings.push(copy[language].findings.acuityDiff);
  if (state.astigmatism) specificFindings.push(copy[language].findings.astig);
  if ((state.contrastSensitivity ?? 0) < 3)
    specificFindings.push(copy[language].findings.contrastLow);
  if (strainLevel === "High")
    specificFindings.push(copy[language].findings.strainHigh);
  if (state.wearsGlasses) {
    const leftWithout = state.acuityLeftWithout ?? null;
    const leftWith = state.acuityLeftWith ?? null;
    const rightWithout = state.acuityRightWithout ?? null;
    const rightWith = state.acuityRightWith ?? null;
    const improved =
      (leftWith != null && leftWithout != null && leftWith > leftWithout) ||
      (rightWith != null && rightWithout != null && rightWith > rightWithout);
    if (improved) specificFindings.push(copy[language].findings.glassesHelp);
  }

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

      <AgeVisionChart
        title={t(language, "results.risk_section")}
        data={riskData}
      />

      <AgeVisionChart
        title={copy[language].scoresChartTitle}
        data={scoreBars}
      />

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

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-4">
          {copy[language].detailsTitle}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-zinc-700">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="font-semibold text-zinc-900 mb-1">
              {copy[language].metrics.amsler}
            </div>
            <div>
              {state.amslerDistorted == null
                ? copy[language].values.notTaken
                : state.amslerDistorted
                  ? copy[language].values.distorted
                  : copy[language].values.ok}
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="font-semibold text-zinc-900 mb-1">
              {t(language, "results.strain_label", {
                level: strainLevelLabel(language, strainLevel),
              })}
            </div>
            <div>
              {strainYes == null
                ? copy[language].values.notTaken
                : format(copy[language].answersStrain, {
                    yes: strainYes,
                    total: strainTotal,
                  })}
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="font-semibold text-zinc-900 mb-1">
              {t(language, "results.issues.astigmatism")}
            </div>
            <div>
              {state.astigmatism == null
                ? copy[language].values.notTaken
                : state.astigmatism
                  ? copy[language].values.yes
                  : copy[language].values.no}
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="font-semibold text-zinc-900 mb-1">
              {t(language, "results.issues.contrast")}
            </div>
            <div>
              {state.contrastSensitivity == null
                ? copy[language].values.notTaken
                : `${state.contrastSensitivity + 1}/6`}
            </div>
          </div>
        </div>
      </div>

      {specificFindings.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">
            {copy[language].findingsTitle}
          </h3>
          <ul className="space-y-2">
            {specificFindings.map((f, idx) => (
              <li key={idx} className="flex items-start gap-3 text-zinc-700">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-2" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
                level: strainLevelLabel(language, strainLevel),
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
