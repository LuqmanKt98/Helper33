import * as React from "react"
import { cn } from "@/lib/utils"

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {}
});

const Popover = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const { setOpen } = React.useContext(PopoverContext);
  
  const handleClick = (e) => {
    setOpen(prev => !prev);
    if (props.onClick) props.onClick(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      ref
    });
  }

  return (
    <button
      ref={ref}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

const PopoverContent = React.forwardRef(({ 
  className, 
  align = "center", 
  sideOffset = 4,
  children,
  ...props 
}, ref) => {
  const { open, setOpen } = React.useContext(PopoverContext);
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);

  if (!open) return null;

  const alignmentClasses = {
    center: 'left-1/2 -translate-x-1/2',
    start: 'left-0',
    end: 'right-0'
  };

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 mt-2 w-72 rounded-md border bg-white p-4 shadow-lg animate-in fade-in-0 zoom-in-95",
          alignmentClasses[align],
          className
        )}
        style={{ top: `${sideOffset}px` }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent }