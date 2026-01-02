import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100, 
  step = 1, 
  value = [0], 
  onValueChange,
  ...props 
}, ref) => {
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        {/* Progress Fill */}
        <div 
          className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Input Range */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0] || 0}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        
        {/* Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white shadow-lg pointer-events-none transition-all"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    </div>
  );
});

Slider.displayName = "Slider"

export { Slider }