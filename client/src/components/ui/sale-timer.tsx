import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface SaleTimerProps {
  initialHours: number;
  initialMinutes: number;
  initialSeconds: number;
}

const SaleTimer = ({ 
  initialHours = 19, 
  initialMinutes = 34, 
  initialSeconds = 52 
}: SaleTimerProps) => {
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds === 0) {
          setMinutes(prevMinutes => {
            if (prevMinutes === 0) {
              setHours(prevHours => {
                if (prevHours === 0) {
                  return 23; // Reset to 24 hours
                }
                return prevHours - 1;
              });
              return 59;
            }
            return prevMinutes - 1;
          });
          return 59;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sale-timer text-[#878787] flex items-center">
      <Clock className="mr-1" size={16} />
      <span>{hours}h</span> : <span>{minutes.toString().padStart(2, '0')}m</span> : <span>{seconds.toString().padStart(2, '0')}s</span> Left
    </div>
  );
};

export default SaleTimer;
