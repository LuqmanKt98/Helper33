import * as React from "react"

/** @typedef {{className?: string, children?: React.ReactNode} & React.HTMLAttributes<HTMLDivElement>} CardProps */

/** @type {React.ForwardRefExoticComponent<CardProps>} */
const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = "Card"

/** @type {React.ForwardRefExoticComponent<CardProps>} */
const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = "CardHeader"

/** @type {React.ForwardRefExoticComponent<CardProps>} */
const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  >
    {children}
  </h3>
))
CardTitle.displayName = "CardTitle"

/** @type {React.ForwardRefExoticComponent<CardProps>} */
const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className || ''}`}
    {...props}
  >
    {children}
  </p>
))
CardDescription.displayName = "CardDescription"

/** @type {React.ForwardRefExoticComponent<CardProps>} */
const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
))
CardContent.displayName = "CardContent"

/** @type {React.ForwardRefExoticComponent<CardProps>} */
const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className || ''}`}
    {...props}
  >
    {children}
  </div>
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }