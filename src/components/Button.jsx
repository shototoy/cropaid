
import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
    const baseStyle = "w-full flex items-center justify-center p-3.5 rounded-sm font-semibold transition-transform active:scale-95";
    const variantStyle = variant === 'secondary'
        ? 'bg-primary-bg text-primary hover:bg-opacity-80'
        : 'bg-primary text-white hover:bg-opacity-90';

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variantStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
