import { useState, useEffect, useRef } from 'react';

interface BtcPriceData {
  price: number | null;
  priceChange: number | null;
  isConnected: boolean;
}

export function useBtcPrice() {
  const [data, setData] = useState<BtcPriceData>({
    price: null,
    priceChange: null,
    isConnected: false
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPriceRef = useRef<number | null>(null);

  const connectWebSocket = () => {
    try {
      // Use Binance WebSocket for real-time BTC price
      wsRef.current = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
      
      wsRef.current.onopen = () => {
        console.log('🔗 BTC WebSocket connected');
        setData(prev => ({ ...prev, isConnected: true }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const currentPrice = parseFloat(data.c); // Current price
          const priceChangePercent = parseFloat(data.P); // Price change percentage
          
          // Calculate price change from last price if available
          let priceChange = priceChangePercent;
          if (lastPriceRef.current && currentPrice) {
            priceChange = ((currentPrice - lastPriceRef.current) / lastPriceRef.current) * 100;
          }
          
          setData(prev => ({
            ...prev,
            price: currentPrice,
            priceChange: priceChangePercent
          }));
          
          lastPriceRef.current = currentPrice;
        } catch (error) {
          console.error('Error parsing BTC price data:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('🔌 BTC WebSocket disconnected');
        setData(prev => ({ ...prev, isConnected: false }));
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('BTC WebSocket error:', error);
        setData(prev => ({ ...prev, isConnected: false }));
      };

    } catch (error) {
      console.error('Failed to connect to BTC WebSocket:', error);
      // Fallback: try to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
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

  // Function to get current price for duel
  const getCurrentPrice = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (data.price) {
        resolve(data.price);
      } else {
        // Fallback: fetch from Binance REST API
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
          .then(response => response.json())
          .then(data => resolve(parseFloat(data.price)))
          .catch(reject);
      }
    });
  };

  return {
    ...data,
    getCurrentPrice
  };
}