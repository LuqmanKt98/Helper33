import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * @typedef {Object} ButtonProps
 * @property {string} [className]
 * @property {"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"} [variant]
 * @property {"default" | "sm" | "lg" | "icon"} [size]
 * @property {boolean} [asChild]
 * @property {boolean} [enableSound]
 * @property {string} [soundType]
 * @property {React.ReactNode} [children]
 * @property {React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"]} [onClick]
 */

/** @type {React.ForwardRefExoticComponent<ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>>} */
const Button = React.forwardRef(({
  className,
  variant,
  size,
  asChild = false,
  enableSound = true,
  soundType = 'click',
  children,
  ...props
}, ref) => {
  const handleClick = (e) => {
    // Play UI sound
    if (enableSound && typeof window !== 'undefined') {
      const event = new CustomEvent('playUISound', { detail: { type: soundType } });
      window.dispatchEvent(event);
    }

    // Call original onClick
    if (props.onClick) {
      props.onClick(e);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(buttonVariants({ variant, size, className })),
      ref,
      ...props,
      onClick: handleClick
    });
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
      onClick={handleClick}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }