import React from 'react';
import { PageHeader } from '../PageHeader';
import { ArchitectureDiagram } from '../ArchitectureDiagram';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        eyebrow="DISTRIBUTED TOPOLOGY"
        title="Production Architecture & Gateway Topology"
        description="Stateless in-memory proxy architecture deployed directly between vector storage and LLM inference endpoints."
      />

      <div className="pt-2">
        <ArchitectureDiagram />
      </div>
    </div>
  );
};
