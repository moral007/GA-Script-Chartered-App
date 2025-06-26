/**
 * Scroll Area UI component
 */

import * as React from "react"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative overflow-auto ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"
