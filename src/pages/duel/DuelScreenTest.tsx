import React from 'react';
import { useParams } from 'react-router-dom';

export default function DuelScreenTest() {
  const { duelId } = useParams();
  
  console.log('🧪 DuelScreenTest montado com duelId:', duelId);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">🧪 Teste Duel Screen</h1>
        <p className="text-lg">Duel ID: <strong>{duelId}</strong></p>
        <p className="text-muted-foreground">
          Se você está vendo esta tela, a rota está funcionando!
        </p>
        <div className="text-xs text-muted-foreground">
          URL: {window.location.href}
        </div>
      </div>
    </div>
  );
}