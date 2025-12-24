import { useEffect, useRef } from 'react';
import './LiveMetricsChart.css';

const LiveMetricsChart = ({ metrics, history = [] }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !metrics) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw metrics bars
    const metricKeys = Object.keys(metrics);
    const barWidth = width / metricKeys.length - 10;
    const maxHeight = height - 30;
    
    metricKeys.forEach((key, index) => {
      const value = metrics[key];
      const x = index * (barWidth + 10) + 5;
      const barHeight = (value / 100) * maxHeight;
      const y = height - barHeight - 20;
      
      // Gradient fill
      const gradient = ctx.createLinearGradient(x, y, x, height - 20);
      if (value >= 90) {
        gradient.addColorStop(0, '#64ff8d');
        gradient.addColorStop(1, '#64ffda');
      } else if (value >= 70) {
        gradient.addColorStop(0, '#64ffda');
        gradient.addColorStop(1, '#b264ff');
      } else {
        gradient.addColorStop(0, '#ffc864');
        gradient.addColorStop(1, '#ff647f');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Value text
      ctx.fillStyle = '#e6f1ff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(value)}%`, x + barWidth / 2, y - 5);
    });
    
  }, [metrics, history]);
  
  return (
    <div className=\"live-metrics-chart\">
      <canvas 
        ref={canvasRef}
        width={600}
        height={200}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default LiveMetricsChart;
