import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center text-sm text-gray-600">
      {timeLeft > 0 ? (
        <span>Resend OTP in {formatTime(timeLeft)}</span>
      ) : (
        <span>You can now request a new OTP</span>
      )}
    </div>
  );
};

export default Timer;