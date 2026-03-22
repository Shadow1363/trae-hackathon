import { create } from "zustand";

export type Step =
  | "landing"
  | "age_check"
  | "glasses_check"
  | "acuity_left_without"
  | "acuity_right_without"
  | "acuity_left_with"
  | "acuity_right_with"
  | "astigmatism"
  | "contrast"
  | "amsler"
  | "questionnaire"
  | "results";

export type Language = "en" | "pt";

export interface VisionState {
  currentStep: Step;
  age: number | null;
  wearsGlasses: boolean | null;
  acuityLeftWithout: number | null; // e.g., line 1 to 10
  acuityRightWithout: number | null;
  acuityLeftWith: number | null;
  acuityRightWith: number | null;
  astigmatism: boolean | null;
  contrastSensitivity: number | null;
  amslerDistorted: boolean | null;
  strainScore: number | null;
  language: Language;

  // Actions
  setStep: (step: Step) => void;
  setAge: (age: number) => void;
  setWearsGlasses: (wears: boolean) => void;
  setAcuity: (
    eye: "left" | "right",
    condition: "with" | "without",
    line: number,
  ) => void;
  setAstigmatism: (uneven: boolean) => void;
  setContrast: (level: number) => void;
  setAmsler: (distorted: boolean) => void;
  setStrainScore: (score: number) => void;
  setLanguage: (language: Language) => void;
  reset: () => void;
}

const initialState = {
  currentStep: "landing" as Step,
  age: null,
  wearsGlasses: null,
  acuityLeftWithout: null,
  acuityRightWithout: null,
  acuityLeftWith: null,
  acuityRightWith: null,
  astigmatism: null,
  contrastSensitivity: null,
  amslerDistorted: null,
  strainScore: null,
  language: "en" as Language,
};

export const useVisionStore = create<VisionState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  setAge: (age) => set({ age }),
  setWearsGlasses: (wearsGlasses) => set({ wearsGlasses }),
  setAcuity: (eye, condition, line) => {
    if (eye === "left" && condition === "without")
      set({ acuityLeftWithout: line });
    if (eye === "right" && condition === "without")
      set({ acuityRightWithout: line });
    if (eye === "left" && condition === "with") set({ acuityLeftWith: line });
    if (eye === "right" && condition === "with") set({ acuityRightWith: line });
  },
  setAstigmatism: (astigmatism) => set({ astigmatism }),
  setContrast: (contrastSensitivity) => set({ contrastSensitivity }),
  setAmsler: (amslerDistorted) => set({ amslerDistorted }),
  setStrainScore: (strainScore) => set({ strainScore }),
  setLanguage: (language) => set({ language }),
  reset: () => set(initialState),
}));
