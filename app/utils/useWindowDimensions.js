import { useEffect, useState } from "react";

export const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
      });
  
    useEffect(() => {
      const handleResize = () => {
        console.log("RESIZE", {
          width: window.innerWidth,
          height: window.innerHeight
        })
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    return windowDimensions;
  };