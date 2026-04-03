import { useState, useEffect, useRef, ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navType = useNavigationType();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<'enter' | 'idle' | 'exit'>('idle');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (location.key === prevKey.current) return;

    const isBack = navType === 'POP';
    setDirection(isBack ? 'back' : 'forward');
    setStage('exit');

    const timer = setTimeout(() => {
      prevKey.current = location.key;
      setDisplayChildren(children);
      setStage('enter');

      const enterTimer = setTimeout(() => setStage('idle'), 350);
      return () => clearTimeout(enterTimer);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.key, children, navType]);

  const getClassName = () => {
    if (stage === 'idle') return 'scale-100 opacity-100';
    if (stage === 'exit') {
      return direction === 'forward'
        ? 'scale-[0.85] opacity-0'
        : 'scale-110 opacity-0';
    }
    // enter
    return direction === 'forward'
      ? 'scale-110 opacity-0'
      : 'scale-[0.85] opacity-0';
  };

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${getClassName()}`}
      style={{ minHeight: '100vh' }}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
