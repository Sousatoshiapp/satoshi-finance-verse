import { useState, useEffect, useRef } from 'react';

interface BtcPriceData {
  price: number | null;
  priceChange: number | null;
  isConnected: boolean;
}

export function useBtcPrice() {
  // PERFORMANCE: WebSocket completamente desabilitado para melhorar performance do dashboard
  // Este hook estava causando overhead significativo com reconnexões constantes
  
  /* CÓDIGO ORIGINAL COMENTADO PARA PERFORMANCE:
  
  const [data, setData] = useState<BtcPriceData>({
    price: null,
    priceChange: null,
    isConnected: false
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPriceRef = useRef<number | null>(null);

  const connectWebSocket = () => {
    // WebSocket logic...
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
  
  */

  // Retorna dados mock para manter compatibilidade
  const [data] = useState<BtcPriceData>({
    price: 45000, // Preço mock
    priceChange: 2.5, // Mudança mock
    isConnected: false // Sempre false pois WebSocket está desabilitado
  });

  // Function to get current price for duel (mock)
  const getCurrentPrice = (): Promise<number> => {
    return Promise.resolve(45000); // Retorna preço mock
  };

  return {
    ...data,
    getCurrentPrice
  };
}