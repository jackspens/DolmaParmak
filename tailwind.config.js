/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                neon: {
                    50: '#f0fdf9',
                    100: '#ccfbef',
                    200: '#99f6df',
                    300: '#5ce9c7',
                    400: '#2dd4a4',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    700: '#334155',
                    800: '#1e293b',
                    850: '#172033',
                    900: '#0f172a',
                    950: '#080d1a',
                }
            },
            fontFamily: {
                mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'counter': 'counter 0.5s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'fade-up': 'fadeUp 0.4s ease-out',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #10b981, 0 0 10px #10b981, 0 0 20px #10b981' },
                    '100%': { boxShadow: '0 0 10px #10b981, 0 0 30px #10b981, 0 0 60px #10b981' }
                },
                slideIn: {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                fadeUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                }
            },
            backdropBlur: { xs: '2px' },
        }
    },
    plugins: [],
};
