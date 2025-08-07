import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConceptConnectionGame } from '@/components/features/quiz/concept-connection-game';

export default function ConceptConnectionsPage() {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get('theme') || 'basic_finance';

  return (
    <div className="h-screen bg-background overflow-hidden">
      <ConceptConnectionGame theme={theme} />
    </div>
  );
}