import React, { InputHTMLAttributes, forwardRef } from 'react';


interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; 
  error?: string; 
  helperText?: string; 
  className?: string; 
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  label,
  error,
  helperText,
  className = '',
  ...props 
}, ref) => {
  const hasError = !!error; 

  return (
    <div className={`mb-4 ${className}`}> {/* Container for label, input, error */}
      {label && (
        <label
          htmlFor={props.id} 
          className="block text-sm font-semibold text-[#130160] mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref} 
        className={`w-full p-2 border rounded-md text-gray-600 shadow-sm focus:ring-2 focus:ring-offset-2
          ${hasError
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-[#ffffff] focus:border-[#130160]' 
          }`}
        {...props} 
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>} {/* Error message */}
      {!error && helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>} {/* Helper text */}
    </div>
  );
});

TextField.displayName = 'TextField';

export default TextField;