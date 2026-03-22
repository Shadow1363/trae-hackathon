'use client';

import { useVisionStore } from '@/store/useVisionStore';
import LandingScreen from '@/components/tests/LandingScreen';
import AgeCheckScreen from '@/components/tests/AgeCheckScreen';
import GlassesCheckScreen from '@/components/tests/GlassesCheckScreen';
import VisualAcuityTest from '@/components/tests/VisualAcuityTest';
import AstigmatismTest from '@/components/tests/AstigmatismTest';
import ContrastSensitivityTest from '@/components/tests/ContrastSensitivityTest';
import AmslerGridTest from '@/components/tests/AmslerGridTest';
import QuestionnaireScreen from '@/components/tests/QuestionnaireScreen';
import ResultsScreen from '@/components/tests/ResultsScreen';

export default function Home() {
  const currentStep = useVisionStore((state) => state.currentStep);

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm p-6 sm:p-10 border border-zinc-100">
        {currentStep === 'landing' && <LandingScreen />}
        {currentStep === 'age_check' && <AgeCheckScreen />}
        {currentStep === 'glasses_check' && <GlassesCheckScreen />}
        {currentStep.startsWith('acuity_') && <VisualAcuityTest />}
        {currentStep === 'astigmatism' && <AstigmatismTest />}
        {currentStep === 'contrast' && <ContrastSensitivityTest />}
        {currentStep === 'amsler' && <AmslerGridTest />}
        {currentStep === 'questionnaire' && <QuestionnaireScreen />}
        {currentStep === 'results' && <ResultsScreen />}
      </div>
    </main>
  );
}
