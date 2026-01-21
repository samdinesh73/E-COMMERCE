import React from "react";
import { cn } from "../../lib/utils";

// Card Component
export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h2
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-slate-600 dark:text-slate-400", className)}
    {...props}
  />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);

// Button Component
export const Button = React.forwardRef(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline:
        "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
      secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
      ghost: "hover:bg-slate-100 text-slate-900",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Badge Component
export const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-blue-100 text-blue-900",
    secondary: "bg-slate-100 text-slate-900",
    destructive: "bg-red-100 text-red-900",
    success: "bg-green-100 text-green-900",
    warning: "bg-yellow-100 text-yellow-900",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

// Input Component
export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    className={cn(
      "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

// Select Component
export const Select = ({ className, ...props }) => (
  <select
    className={cn(
      "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

// Table Components
export const Table = ({ className, ...props }) => (
  <table className={cn("w-full text-sm", className)} {...props} />
);

export const TableHeader = ({ className, ...props }) => (
  <thead className={cn("border-b border-slate-200 bg-slate-50", className)} {...props} />
);

export const TableBody = ({ className, ...props }) => (
  <tbody className={cn("", className)} {...props} />
);

export const TableRow = ({ className, ...props }) => (
  <tr
    className={cn(
      "border-b border-slate-200 hover:bg-slate-50 transition-colors",
      className
    )}
    {...props}
  />
);

export const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      "h-12 px-6 text-left align-middle font-medium text-slate-700",
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }) => (
  <td className={cn("px-6 py-4 align-middle", className)} {...props} />
);

// Dialog/Modal Component
export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ className, ...props }) => (
  <div className={cn("p-6", className)} {...props} />
);

export const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
);

export const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

// Tabs Component
export const Tabs = ({ value, onValueChange, children, className, ...props }) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

export const TabsList = ({ className, ...props }) => (
  <div
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1",
      className
    )}
    {...props}
  />
);

export const TabsTrigger = ({ value, active, onClick, className, ...props }) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      active
        ? "bg-white text-slate-900 shadow-sm"
        : "text-slate-600 hover:text-slate-900",
      className
    )}
    {...props}
  />
);

export const TabsContent = ({ value, active, className, ...props }) => (
  <div
    className={cn("mt-2 ring-offset-white", !active && "hidden", className)}
    {...props}
  />
);

// Alert Component
export const Alert = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-blue-50 border border-blue-200",
    destructive: "bg-red-50 border border-red-200",
    success: "bg-green-50 border border-green-200",
    warning: "bg-yellow-50 border border-yellow-200",
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-lg p-4",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export const AlertTitle = ({ className, ...props }) => (
  <h5 className={cn("mb-1 font-medium leading-tight", className)} {...props} />
);

export const AlertDescription = ({ className, ...props }) => (
  <div className={cn("text-sm", className)} {...props} />
);

// Skeleton Component
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn("animate-pulse rounded-md bg-slate-200", className)}
    {...props}
  />
);
