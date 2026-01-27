import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  children?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  classNameLabel?: string;
  classNameIcon?: string;
  classNameContainer?: string;
  required?: boolean;
  description?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label = '',
      options,
      children,
      leftIcon,
      rightIcon,
      className = '',
      classNameLabel = '',
      classNameIcon = '',
      classNameContainer = '',
      required = false,
      description = '',
      ...props
    },
    ref,
  ) => {
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

          <select
            ref={ref}
            className={`${className} bg-white text-base font-light block w-full p-2.5 rounded-lg border border-solid border-neutral-300 focus-within:ring-[0.5px] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-brand-400 focus:border-brand-400 disabled:cursor-not-allowed placeholder:text-neutral-300 disabled:bg-neutral-100/60 disabled:text-neutral-500 appearance-none ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''}`}
            {...props}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {rightIcon && (
            <div
              className={`absolute h-full flex items-center ${
                classNameIcon ? classNameIcon : 'right-2.5'
              }`}
            >
              {rightIcon}
            </div>
          )}

          {!rightIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}

          {leftIcon && (
            <div className="absolute left-2.5 flex items-center h-full">{leftIcon}</div>
          )}
        </div>

        {description !== '' ? (
          <p className="text-xs text-neutral-400 mt-1">{description}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';

