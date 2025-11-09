import React, { ButtonHTMLAttributes } from 'react';
import { FaSpinner, FaUser, FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'accent' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  icon,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';

  const variantClasses = {
    primary: 'bg-municipal-primary text-white focus:ring-municipal-primary shadow-lg hover:shadow-xl',
    accent: 'bg-municipal-accent text-white  focus:ring-municipal-accent shadow-lg hover:shadow-xl',
    secondary: 'bg-municipal-secondary text-white focus:ring-municipal-secondary shadow-lg hover:shadow-xl',
    danger: 'bg-municipal-error text-white  focus:ring-municipal-error shadow-lg hover:shadow-xl',
    success: 'bg-municipal-success text-white  focus:ring-municipal-success shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300 border border-gray-300'
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-2 gap-1',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
    xl: 'text-lg px-8 py-4 gap-3'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <FaSpinner className="animate-spin h-4 w-4 text-current" />
          Loading...
        </span>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;