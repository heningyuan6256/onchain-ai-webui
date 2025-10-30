import React, { useEffect, useRef } from 'react';

const DotLoading = ({
  width = 113,
  height = 16,
  dotCount = 25,
  color = 'rgba(30, 30, 30, 1)',
  background = 'linear-gradient(141deg, #FFFFFF 0%, #F4F4F5 0%)'
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let animationId;
    let time = 0; // 累积时间

    // ✨高清画布
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 初始化点数据
    const dots = Array.from({ length: dotCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseSize: Math.random() * 0.6 + 1,
      speedY: Math.random() * 0.3 + 0.2,
      speedX: Math.random() * 0.4 + 0.3,
      offset: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02; // 控制波动速度（越大越快）

      dots.forEach(dot => {
        // 水平流动
        dot.x += dot.speedX * 0.8;
        if (dot.x > width) dot.x = 0;

        // 垂直平滑波动
        dot.y += Math.sin(time + dot.offset) * dot.speedY * 0.2;

        // 大小随 x 坐标变化（越往右越小）
        const sizeScale = 1 - dot.x / width;
        const size = dot.baseSize * (0.5 + sizeScale * 0.5);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [width, height, dotCount, color]);

  return (
    <div
      style={{
        background,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px',
        padding: '10px 20px',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ background: 'transparent', width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
};

export default DotLoading;
