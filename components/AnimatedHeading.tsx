'use client';
import React, { useEffect, useState } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AnimatedHeading({ text, className = "", style }: AnimatedHeadingProps) {
  const [animated, setAnimated] = useState(false);
  const lines = text.split('\n');
  const charDelay = 30; // ms
  const initialDelay = 200; // ms

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 className={className} style={{ ...style, lineHeight: '1.15' }}>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        return (
          <span key={lineIndex} className="block">
            {line.split('').map((char, charIndex) => {
              const delay = (lineIndex * lineLength * charDelay) + (charIndex * charDelay);
              const displayChar = char === ' ' ? '\u00A0' : char;
              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all ease-out"
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateX(0px)' : 'translateX(-18px)',
                    transitionDuration: '500ms',
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
