
import React from 'react';

export default function Layout({ children, className = '' }) {
    return (
        <div className={`max-w-[480px] mx-auto min-h-screen p-5 flex flex-col relative animate-fade-in ${className}`}>
            {children}
        </div>
    );
}
