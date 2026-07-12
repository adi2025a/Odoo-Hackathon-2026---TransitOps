import React, { useState } from 'react';
import { cn } from '../../utils/format';
import { X } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500";
  
  const variants = {
    primary: "bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 shadow-subtle",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
    outline: "border border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/50 bg-transparent",
    danger: "bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-900 dark:text-rose-100 dark:hover:bg-rose-850 shadow-subtle",
    ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 bg-transparent",
    glass: "glass-panel text-slate-900 dark:text-slate-50 hover:bg-white/90 dark:hover:bg-card/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
    icon: "h-9 w-9",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- CARD ---
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("bg-card text-card-foreground border rounded-xl shadow-premium dark:shadow-premium-dark", className)} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-slate-100 dark:border-slate-800/60", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-6", className)} {...props}>
    {children}
  </div>
);

// --- BADGE ---
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default', ...props }) => {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none";
  
  const variants = {
    default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30",
    error: "bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/30",
    info: "bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
    outline: "border border-slate-200 text-slate-900 dark:border-slate-800 dark:text-slate-300",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

// --- INPUT & SELECT ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-subtle transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-zinc-900 dark:placeholder:text-zinc-500 dark:focus:ring-slate-500",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-subtle transition-colors focus:ring-1 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-zinc-900 dark:focus:ring-slate-500",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

// --- DIALOG (MODAL) ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-card border rounded-xl shadow-premium dark:shadow-premium-dark flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto premium-scroll flex-1">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end space-x-2 p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- TABS ---
interface TabsProps {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children }) => {
  return <div className="space-y-4">{children}</div>;
};

export const TabsList: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-zinc-400", className)}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  activeTab: string;
  onClick: (value: string) => void;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, activeTab, onClick, children }) => {
  const active = activeTab === value;
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        active 
          ? "bg-white text-slate-950 shadow-subtle dark:bg-zinc-950 dark:text-slate-50" 
          : "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string, activeTab: string, children: React.ReactNode }> = ({ value, activeTab, children }) => {
  if (value !== activeTab) return null;
  return <div className="focus-visible:outline-none animate-fade-in">{children}</div>;
};

// --- ACCORDION ---
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full font-medium text-sm text-left transition hover:text-slate-950 dark:hover:text-slate-50"
      >
        <span>{title}</span>
        <svg
          className={cn("w-4 h-4 transition-transform duration-200", isOpen && "transform rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-96 mt-2 opacity-100" : "max-h-0 opacity-0")}>
        <div className="text-sm text-muted-foreground pb-2">{children}</div>
      </div>
    </div>
  );
};

// --- TOOLTIP ---
interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-slate-900 rounded-md shadow-premium -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap dark:bg-zinc-800 dark:text-zinc-200 border border-slate-800">
          {content}
        </div>
      )}
    </div>
  );
};
