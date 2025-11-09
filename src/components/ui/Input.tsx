import React from 'react';
import { FaEnvelope, FaLock, FaUser, FaSearch, FaCalendar } from 'react-icons/fa';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: 'email' | 'password' | 'user' | 'search' | 'calendar' | React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  const baseClasses = 'block w-full rounded-xl bg-white py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-municipal-primary focus:outline-none transition-all duration-200 sm:text-sm sm:leading-6 transform hover:scale-[1.01] focus:scale-[1.02]';
  
  const iconMap = {
    email: <FaEnvelope className="h-4 w-4 text-gray-400" />,
    password: <FaLock className="h-4 w-4 text-gray-400" />,
    user: <FaUser className="h-4 w-4 text-gray-400" />,
    search: <FaSearch className="h-4 w-4 text-gray-400" />,
    calendar: <FaCalendar className="h-4 w-4 text-gray-400" />,
  };

  const getIcon = () => {
    if (typeof icon === 'string' && icon in iconMap) {
      return iconMap[icon as keyof typeof iconMap];
    }
    return icon;
  };

  const inputClasses = [
    baseClasses,
    error && 'ring-red-500 focus:ring-red-500',
    icon && 'pl-10',
    className,
  ].join(' ');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getIcon()}
          </div>
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;