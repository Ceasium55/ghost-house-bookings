import { useState, useEffect, useRef, ReactNode, CSSProperties } from 'react';
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

      // Small delay so 'enter' initial state renders, then transition to 'idle'
      const enterTimer = setTimeout(() => setStage('idle'), 50);
      return () => clearTimeout(enterTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.key, children, navType]);

  const getWrapperStyle = (): CSSProperties => {
    const base: CSSProperties = { minHeight: '100vh', overflow: 'hidden' };

    if (stage === 'idle') {
      return { ...base, transform: 'scale(1)', opacity: 1, transition: 'transform 0.45s ease-out, opacity 0.45s ease-out' };
    }

    if (stage === 'exit') {
      if (direction === 'back') {
        // Back exit: zoom out to background
        return { ...base, transform: 'scale(0.8)', opacity: 0, transition: 'transform 0.5s ease-in, opacity 0.5s ease-in' };
      }
      // Forward exit: wrapper stays normal, split elements animate via CSS
      return { ...base, transform: 'scale(1)', opacity: 1, transition: 'none' };
    }

    // Enter
    if (direction === 'forward') {
      // Forward enter: zoom in from background (start small)
      return { ...base, transform: 'scale(0.8)', opacity: 0, transition: 'none' };
    }
    // Back enter: wrapper normal, split elements come from sides via CSS
    return { ...base, transform: 'scale(1)', opacity: 1, transition: 'none' };
  };

  return (
    <div data-stage={stage} data-direction={direction} style={getWrapperStyle()}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
