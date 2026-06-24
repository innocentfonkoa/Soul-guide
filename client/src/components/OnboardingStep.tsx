import { ReactNode } from 'react';

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  children: ReactNode;
}

export default function OnboardingStep({ step, totalSteps, children }: OnboardingStepProps) {
  return (
    <div className="flex flex-col min-h-screen bg-cream px-6 py-8">
      {/* Progress dots */}
      <div className="flex gap-2 justify-center mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === step - 1
                ? 'w-6 h-2 bg-sage-600'
                : i < step - 1
                ? 'w-2 h-2 bg-sage-400'
                : 'w-2 h-2 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col animate-fade-in">
        {children}
      </div>
    </div>
  );
}
