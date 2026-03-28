import { useState, useEffect, useCallback } from 'react';
import { Ghost } from 'lucide-react';

const ORBIT_RADIUS = 180;
const SPEED = 0.02; // radians per frame
const DISAPPEAR_DURATION = 5000;

// 6 o'clock = Math.PI/2 (bottom). Starting position near main ghost = -Math.PI/2 (top)
const START_ANGLE = -Math.PI / 2;
const BOUNCE_ANGLE = Math.PI / 2; // 6 o'clock position

const FloatingGhosts = () => {
  const [leftAngle, setLeftAngle] = useState(START_ANGLE);
  const [rightAngle, setRightAngle] = useState(START_ANGLE);
  const [leftDir, setLeftDir] = useState(1); // 1 = CCW (angle increasing), -1 = back
  const [rightDir, setRightDir] = useState(-1); // -1 = CW (angle decreasing), 1 = back
  const [leftVisible, setLeftVisible] = useState(true);
  const [rightVisible, setRightVisible] = useState(true);

  useEffect(() => {
    let animId: number;
    const animate = () => {
      setLeftAngle(prev => {
        const next = prev + SPEED * leftDir;
        // CCW goes from -PI/2 toward PI/2 (positive direction in our frame)
        if (leftDir === 1 && next >= BOUNCE_ANGLE) {
          setLeftDir(-1);
          return BOUNCE_ANGLE;
        }
        if (leftDir === -1 && next <= START_ANGLE) {
          setLeftDir(1);
          return START_ANGLE;
        }
        return next;
      });

      setRightAngle(prev => {
        const next = prev + SPEED * rightDir;
        // CW goes from -PI/2 toward -3PI/2 which is same as going negative
        // Normalize: CW means decreasing angle. Bounce at bottom = -3*PI/2 or equivalently going to PI/2 via negative
        // Simpler: mirror the left ghost. Right goes negative from start.
        if (rightDir === -1 && next <= -Math.PI - Math.PI / 2) {
          setRightDir(1);
          return -Math.PI - Math.PI / 2;
        }
        if (rightDir === 1 && next >= START_ANGLE) {
          setRightDir(-1);
          return START_ANGLE;
        }
        return next;
      });

      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [leftDir, rightDir]);

  const handleClickLeft = useCallback(() => {
    setLeftVisible(false);
    setTimeout(() => {
      setLeftAngle(START_ANGLE);
      setLeftDir(1);
      setLeftVisible(true);
    }, DISAPPEAR_DURATION);
  }, []);

  const handleClickRight = useCallback(() => {
    setRightVisible(false);
    setTimeout(() => {
      setRightAngle(START_ANGLE);
      setRightDir(-1);
      setRightVisible(true);
    }, DISAPPEAR_DURATION);
  }, []);

  // Left ghost orbits to the left of center
  const leftX = -ORBIT_RADIUS + Math.cos(leftAngle) * ORBIT_RADIUS;
  const leftY = Math.sin(leftAngle) * ORBIT_RADIUS;

  // Right ghost orbits to the right of center
  const rightX = ORBIT_RADIUS + Math.cos(rightAngle) * ORBIT_RADIUS;
  const rightY = Math.sin(rightAngle) * ORBIT_RADIUS;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center" style={{ top: '40px' }}>
      <div className="relative">
        {/* Left ghost */}
        {leftVisible && (
          <div
            className="pointer-events-auto absolute cursor-pointer transition-opacity duration-300 hover:scale-110"
            style={{
              transform: `translate(${leftX}px, ${leftY}px)`,
              left: '-12px',
              top: '-12px',
            }}
            onClick={handleClickLeft}
          >
            <Ghost className="w-8 h-8 text-primary opacity-70 drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
        )}

        {/* Right ghost */}
        {rightVisible && (
          <div
            className="pointer-events-auto absolute cursor-pointer transition-opacity duration-300 hover:scale-110"
            style={{
              transform: `translate(${rightX}px, ${rightY}px)`,
              left: '-12px',
              top: '-12px',
            }}
            onClick={handleClickRight}
          >
            <Ghost className="w-8 h-8 text-primary opacity-70 drop-shadow-[0_0_8px_hsl(var(--primary))]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingGhosts;
