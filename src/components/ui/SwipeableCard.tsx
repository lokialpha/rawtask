import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function SwipeableCard({ children, onEdit, onDelete, className }: SwipeableCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const actionWidth = 140; // Width for both actions combined
  const threshold = 60; // Minimum swipe to trigger open

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = startX - e.touches[0].clientX;
    
    if (isOpen) {
      // If already open, allow swiping back
      const newX = Math.max(0, Math.min(actionWidth, actionWidth + (startX - e.touches[0].clientX)));
      setCurrentX(newX);
    } else {
      // Limit swipe distance
      const newX = Math.max(0, Math.min(diff, actionWidth));
      setCurrentX(newX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (currentX > threshold) {
      setIsOpen(true);
      setCurrentX(actionWidth);
    } else {
      setIsOpen(false);
      setCurrentX(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentX(0);
  };

  const handleEdit = () => {
    handleClose();
    onEdit?.();
  };

  const handleDelete = () => {
    handleClose();
    onDelete?.();
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden rounded-2xl", className)}>
      {/* Action buttons */}
      <div className="absolute inset-y-0 right-0 flex">
        <button
          onClick={handleEdit}
          className="w-[70px] bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="w-[70px] bg-expense flex items-center justify-center text-expense-foreground font-medium text-sm"
        >
          Delete
        </button>
      </div>

      {/* Main content */}
      <div
        className="relative bg-card transition-transform duration-200 ease-out"
        style={{ transform: `translateX(-${currentX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isOpen ? handleClose : undefined}
      >
        {children}
      </div>
    </div>
  );
}
