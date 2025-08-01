import { useState, useEffect } from "react";
import { Card } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Button } from "@/components/shared/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Asset } from "./trading-interface";

interface ChartData {
  timestamp: Date;
  price: number;
  volume: number;
}

interface TradingChartProps {
  asset: Asset;
}

export function TradingChart({ asset }: TradingChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('1m');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  // Generate initial chart data
  useEffect(() => {
    const generateData = () => {
      const data: ChartData[] = [];
      let currentPrice = asset.price;
      const now = new Date();
      
      for (let i = 100; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000); // 1 minute intervals
        const volatility = 0.002;
        const change = (Math.random() - 0.5) * 2 * volatility;
        currentPrice = currentPrice * (1 + change);
        
        data.push({
          timestamp,
          price: currentPrice,
          volume: Math.random() * 1000 + 500
        });
      }
      
      setChartData(data);
    };

    generateData();
  }, [asset.symbol]);

  // Update chart data with new price
  useEffect(() => {
    setChartData(prev => {
      const newData = [...prev];
      if (newData.length > 0) {
        // Update the last data point with current price
        newData[newData.length - 1] = {
          ...newData[newData.length - 1],
          price: asset.price
        };
      }
      return newData;
    });
  }, [asset.price]);

  const getChartHeight = () => {
    if (chartData.length === 0) return { max: 0, min: 0, range: 0 };
    const prices = chartData.map(d => d.price);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    return { max, min, range: max - min };
  };

  const renderLineChart = () => {
    const chartHeight = getChartHeight();
    if (chartData.length === 0 || chartHeight.range === 0) return null;
    
    const { max, min, range } = chartHeight;
    const width = 800;
    const height = 300;
    const padding = 40;
    
    const points = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((point.price - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const isPositive = chartData[chartData.length - 1].price > chartData[0].price;

    return (
      <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <g className="opacity-20">
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (height - 2 * padding)) / 4}
              x2={width - padding}
              y2={padding + (i * (height - 2 * padding)) / 4}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* Price area */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill="url(#priceGradient)"
        />
        
        {/* Price line */}
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
          strokeWidth="2"
        />
        
        {/* Price labels */}
        <text
          x={width - padding + 10}
          y={height - padding - ((chartData[chartData.length - 1].price - min) / range) * (height - 2 * padding)}
          fill="hsl(var(--foreground))"
          fontSize="12"
          dy="4"
        >
          ${chartData[chartData.length - 1].price.toFixed(2)}
        </text>
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          {(['1m', '5m', '15m', '1h', '1d'] as const).map(tf => (
            <Button
              key={tf}
              variant={timeframe === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === 'line' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('line')}
          >
            Linha
          </Button>
          <Button
            variant={chartType === 'candlestick' ? "default" : "outline"}
            size="sm"
            onClick={() => setChartType('candlestick')}
          >
            Candlestick
          </Button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-card rounded-lg p-4 min-h-[300px] flex items-center justify-center">
        {chartData.length > 0 ? (
          renderLineChart()
        ) : (
          <div className="text-muted-foreground">Carregando dados do gráfico...</div>
        )}
      </div>

      {/* Chart Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Abertura</div>
          <div className="font-medium">
            ${chartData.length > 0 ? chartData[0].price.toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Máxima</div>
          <div className="font-medium text-success">
            ${chartData.length > 0 ? Math.max(...chartData.map(d => d.price)).toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Mínima</div>
          <div className="font-medium text-destructive">
            ${chartData.length > 0 ? Math.min(...chartData.map(d => d.price)).toFixed(2) : '0.00'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Volume</div>
          <div className="font-medium">
            {chartData.length > 0 ? chartData[chartData.length - 1].volume.toFixed(0) : '0'}
          </div>
        </div>
      </div>
    </div>
  );
}
