import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const handleClick = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      ref={ref}
      role="checkbox"
      aria-checked={checked}
      onClick={handleClick}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded border-2 border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        checked ? "bg-primary text-primary-foreground border-primary" : "bg-white",
        className
      )}
      {...props}
    >
      {checked && (
        <Check className="h-4 w-4 text-white" />
      )}
    </button>
  );
});

Checkbox.displayName = "Checkbox"

export { Checkbox }