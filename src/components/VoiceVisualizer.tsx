
import { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  audioLevel: number;
}

const VoiceVisualizer = ({ isListening, audioLevel }: VoiceVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      if (isListening) {
        const time = Date.now() * 0.005;
        const baseRadius = 40;
        const amplitude = audioLevel * 30 + 10;

        // Draw multiple concentric circles with wave effects
        for (let i = 0; i < 3; i++) {
          const radius = baseRadius + i * 20;
          const waveOffset = i * 0.5;
          
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const wave = Math.sin(time + angle * 4 + waveOffset) * amplitude * (1 - i * 0.3);
            const r = radius + wave;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (angle === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          
          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + amplitude);
          if (i === 0) {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
          } else if (i === 1) {
            gradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)');
            gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
          } else {
            gradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
            gradient.addColorStop(1, 'rgba(236, 72, 153, 0.05)');
          }
          
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw frequency bars around the circle
        const barCount = 32;
        const maxBarHeight = 30;
        
        for (let i = 0; i < barCount; i++) {
          const angle = (Math.PI * 2 * i) / barCount;
          const barHeight = Math.sin(time * 2 + i * 0.3) * maxBarHeight * audioLevel + 5;
          const innerRadius = baseRadius + 50;
          const outerRadius = innerRadius + barHeight;
          
          const x1 = centerX + Math.cos(angle) * innerRadius;
          const y1 = centerY + Math.sin(angle) * innerRadius;
          const x2 = centerX + Math.cos(angle) * outerRadius;
          const y2 = centerY + Math.sin(angle) * outerRadius;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(${(i * 360) / barCount + time * 50}, 70%, 60%, 0.8)`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      } else {
        // Draw static circle when not listening
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, audioLevel]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="rounded-full"
      />
    </div>
  );
};

export default VoiceVisualizer;
