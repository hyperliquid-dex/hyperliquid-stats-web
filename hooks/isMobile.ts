import { useEffect, useState } from 'react';

export function useIsMobile() {
  if (typeof window === "undefined") {
    return [false]; 
  }
  let [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 700);
  useEffect(() => {
    setIsMobile(window.innerWidth < 700);
  }, [window.innerWidth]);

  return [isMobile];
}
