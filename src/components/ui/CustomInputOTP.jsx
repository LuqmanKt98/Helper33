import React, { useRef, forwardRef } from 'react';
import { cn } from "@/lib/utils";

const CustomInputOTP = forwardRef(({ className, length = 6, value, onChange, ...props }, ref) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const { value: inputValue } = e.target;
    // Allow only single digits
    if (!/^[0-9]$/.test(inputValue) && inputValue !== "") return;

    const newOtp = [...value];
    newOtp[index] = inputValue;
    onChange(newOtp.join('').slice(0, length));

    // Move to next input if a digit is entered
    if (inputValue && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, length);
    if (/^[0-9]+$/.test(pasteData)) {
      onChange(pasteData);
      const lastDigitIndex = Math.min(pasteData.length - 1, length - 1);
      // Focus on the last pasted digit's input or the next one
      const focusIndex = Math.min(pasteData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)} {...props} ref={ref}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined} // Only handle paste on the first input
          className={cn(
            "w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-semibold border-2 rounded-lg transition-all duration-200",
            "bg-white/50 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none",
            value[index] ? "border-indigo-400" : ""
          )}
        />
      ))}
    </div>
  );
});
CustomInputOTP.displayName = "CustomInputOTP";

export default CustomInputOTP;