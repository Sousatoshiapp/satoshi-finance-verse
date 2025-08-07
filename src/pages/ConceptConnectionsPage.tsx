import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConceptConnectionGame } from '@/components/features/quiz/concept-connection-game';

export default function ConceptConnectionsPage() {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme') || 'basic_finance';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ConceptConnectionGame theme={theme} />
      </div>
    </div>
  );
}