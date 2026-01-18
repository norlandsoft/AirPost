import React, { useState, useRef, useEffect } from 'react';
import './Splitter.css';

interface SplitterProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const Splitter: React.FC<SplitterProps> = ({
  left,
  right,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 600,
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;
    
    // 限制宽度范围
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setLeftWidth(clampedWidth);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = leftWidth;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="splitter-container">
      <div 
        className="splitter-left" 
        style={{ width: `${leftWidth}px` }}
      >
        {left}
      </div>
      <div
        className={`splitter-divider ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="splitter-divider-line" />
      </div>
      <div 
        className="splitter-right"
        style={{ width: `calc(100% - ${leftWidth}px - 4px)` }}
      >
        {right}
      </div>
    </div>
  );
};

export default Splitter;
