import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  duration: number;
}

export default function CountdownTimer(props: CountdownTimerProps) {
  const { duration } = props;
  const [currentTime, setCurrentTime] = useState<number>(duration);

  useEffect(() => {
    setCurrentTime(duration);
    const timer = setInterval(() => {
      setCurrentTime((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [duration]);

  return <>{currentTime}</>;
}
