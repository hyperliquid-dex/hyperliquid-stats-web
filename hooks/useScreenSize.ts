import React from 'react';

export default function useScreenSize() {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    });
  }, []);

  const isMobile = window.innerWidth <= 700;

  return {
    isMobile: isMobile,
  };
}
