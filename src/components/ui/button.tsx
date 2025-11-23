'use client'

import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "primary" | "glass"
  size?: "default" | "sm" | "md" | "lg" | "icon"
  fullWidth?: boolean
  isLoading?: boolean
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className = "",
    variant = "default",
    size = "default",
    fullWidth = false,
    isLoading = false,
    rounded,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-purple-600 text-white hover:bg-purple-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-600 bg-transparent hover:bg-gray-800 hover:text-white",
      secondary: "bg-gray-700 text-white hover:bg-gray-600",
      ghost: "hover:bg-gray-800 hover:text-white",
      link: "text-purple-400 underline-offset-4 hover:underline",
      gradient: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
    }
    
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8",
      icon: "h-10 w-10"
    }

    const roundedStyles = {
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full"
    }
    
    const roundedClass = rounded ? roundedStyles[rounded] : "rounded-md"
    const widthClass = fullWidth ? "w-full" : ""
    const isDisabled = disabled || isLoading
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${roundedClass} ${widthClass} ${className}`}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }