import { useState, useEffect } from 'react';

const LoadingScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);

    const duration = 2000 + Math.random() * 2000; // 2–4s
    const timer = setTimeout(onFinished, duration);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="w-24 h-24 rounded-xl overflow-hidden mb-6 shadow-lg">
        <img
          src="/images/sf26-bg.png"
          alt="Loading"
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-foreground text-lg font-medium tracking-wide">
        Loading{'.'.repeat(dots)}
      </p>
    </div>
  );
};

export default LoadingScreen;
