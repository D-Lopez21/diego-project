import React from 'react';

export interface InputProps extends React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> {
  label?: string;
  children?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  classNameLabel?: string;
  classNameIcon?: string;
  classNameContainer?: string;
  required?: boolean;
  description?: string;
}

export function Input({
  label = '',
  children,
  leftIcon,
  rightIcon,
  className = '',
  classNameLabel = '',
  classNameIcon = '',
  classNameContainer = '',
  required = false,
  onChange,
  description = '',
  ...props
}: InputProps) {
  return (
    <div className="block w-full text-left">
      {label !== '' ? (
        <p className={`mb-1 font-medium text-sm text-gray-700 ${classNameLabel}`}>
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </p>
      ) : null}

      <div
        className={`${classNameContainer} relative w-full text-gray-900 flex items-center`}
      >
        {children}

        <input
          className={`${className} bg-white text-base font-light block w-full p-2.5 rounded-lg border border-solid border-neutral-300 focus-within:ring-[0.5px] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-brand-400 focus:border-brand-400 disabled:cursor-not-allowed placeholder:text-neutral-300 disabled:bg-neutral-100/60 disabled:text-neutral-500 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''}`}
          onChange={onChange}
          {...props}
        />

        {rightIcon && (
          <div
            className={`absolute h-full flex items-center ${
              classNameIcon ? classNameIcon : 'right-2.5'
            }`}
          >
            {rightIcon}
          </div>
        )}

        {leftIcon && <div className="absolute left-2.5 flex items-center">{leftIcon}</div>}
      </div>

      {description !== '' ? (
        <p className="text-xs text-neutral-400 mt-1">{description}</p>
      ) : null}
    </div>
  );
}
