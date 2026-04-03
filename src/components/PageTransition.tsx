import {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ReactNode,
  CSSProperties,
  isValidElement,
  cloneElement,
} from 'react';
import { useLocation, useNavigationType, type Location } from 'react-router-dom';

const EXIT_DURATION = 500;
const ENTER_KICKOFF_DELAY = 50;

const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navType = useNavigationType();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [displayLocation, setDisplayLocation] = useState<Location>(location);
  const [stage, setStage] = useState<'enter' | 'idle' | 'exit'>('idle');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const prevKey = useRef(location.key);

  useEffect(() => {
    if (location.key === prevKey.current) return;

    const isBack = navType === 'POP';
    setDirection(isBack ? 'back' : 'forward');
    setStage('exit');

    const exitTimer = window.setTimeout(() => {
      prevKey.current = location.key;
      setDisplayChildren(children);
      setDisplayLocation(location);
      setStage('enter');

      const enterTimer = window.setTimeout(() => {
        setStage('idle');
      }, ENTER_KICKOFF_DELAY);

      return () => window.clearTimeout(enterTimer);
    }, EXIT_DURATION);

    return () => window.clearTimeout(exitTimer);
  }, [location, children, navType]);

  const getWrapperStyle = (): CSSProperties => {
    const base: CSSProperties = { minHeight: '100vh' };

    if (stage === 'idle') {
      return {
        ...base,
        transform: 'scale(1)',
        opacity: 1,
        transition: 'transform 0.45s ease-out, opacity 0.45s ease-out',
      };
    }

    if (stage === 'exit') {
      if (direction === 'back') {
        return {
          ...base,
          transform: 'scale(0.8)',
          opacity: 0,
          transition: 'transform 0.5s ease-in, opacity 0.5s ease-in',
        };
      }

      return {
        ...base,
        transform: 'scale(1)',
        opacity: 1,
        transition: 'none',
      };
    }

    if (direction === 'forward') {
      return {
        ...base,
        transform: 'scale(0.8)',
        opacity: 0,
        transition: 'none',
      };
    }

    return {
      ...base,
      transform: 'scale(1)',
      opacity: 1,
      transition: 'none',
    };
  };

  const renderedChildren = isValidElement(children)
    ? cloneElement(displayChildren as ReactElement<{ location?: Location }>, {
        location: displayLocation,
      })
    : displayChildren;

  return (
    <div data-stage={stage} data-direction={direction} style={getWrapperStyle()}>
      {renderedChildren}
    </div>
  );
};

export default PageTransition;
