import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'hero' | 'dark' | 'light';
type ButtonSize = 'default' | 'sm' | 'lg' | 'xl' | 'icon';

const getButtonClasses = (variant?: ButtonVariant, size?: ButtonSize) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";
  
  const variantClasses: Record<ButtonVariant, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    hero: "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-glow transform hover:scale-105",
    dark: "bg-ens-charcoal text-primary-foreground hover:bg-ens-charcoal-light shadow-md",
    light: "bg-background text-foreground border border-border hover:bg-muted",
  };
  
  const sizeClasses: Record<ButtonSize, string> = {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-md px-4",
    lg: "h-14 rounded-xl px-10 text-lg",
    xl: "h-16 rounded-2xl px-12 text-xl",
    icon: "h-10 w-10",
  };
  
  return cn(
    baseClasses,
    variantClasses[variant || 'default'],
    sizeClasses[size || 'default']
  );
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(getButtonClasses(variant, size), className),
        ref,
        ...props,
      });
    }
    
    return (
      <button 
        className={cn(getButtonClasses(variant, size), className)} 
        ref={ref} 
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, getButtonClasses as buttonVariants };
