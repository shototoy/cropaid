/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2E7D32',
                'primary-light': '#4CAF50',
                'primary-bg': '#2E7D32',
                'text-main': '#1F2937',
                'text-muted': '#6B7280',
                'bg-app': '#FFFFFF',
                'bg-surface': '#F3F4F6',
                'border': '#E5E7EB',
                'error': '#EF4444',
            },
            borderRadius: {
                sm: '8px',
                md: '12px',
                lg: '20px',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            backgroundImage: {
                'farm': "url('/src/assets/farm-bg.svg')",
            }
        },
    },
    plugins: [],
}
