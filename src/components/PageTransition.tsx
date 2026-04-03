import { CSSProperties, ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
  stage: 'enter' | 'idle' | 'exit';
  direction: 'forward' | 'back';
};

const PageTransition = ({ children, stage, direction }: PageTransitionProps) => {
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

  return (
    <div data-stage={stage} data-direction={direction} style={getWrapperStyle()}>
      {children}
    </div>
  );
};

export default PageTransition;
