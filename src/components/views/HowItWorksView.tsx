import React from 'react';
import { PageHeader } from '../PageHeader';
import { HowItWorks } from '../HowItWorks';

export const HowItWorksView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        eyebrow="EXECUTION PIPELINE"
        title="How TokenDiet Prunes Prompt Noise"
        description="Four-phase contextual distillation architecture reducing token overhead, latency, and costs before foundation model inference."
      />

      <div className="pt-2">
        <HowItWorks />
      </div>
    </div>
  );
};
