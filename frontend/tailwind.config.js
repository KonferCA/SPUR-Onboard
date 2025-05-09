/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

    theme: {
        extend: {
            colors: {
                'custom-blue-200': '#446E8A',
                'button-default': '#154261',
                'button-primary-25': '#FCDFCB',
                'button-primary-50': '#F9B98D',
                'button-primary-100': '#F4802F',
                'button-primary-200': '#D2691F',
                'button-secondary-100': '#154261',
                'button-secondary-200': '#1C262D',
                'button-primary-text-100': '#B54A00',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            screens: {
                '1.5xl': '1360px',
                '3xl': '1756px',
                '2k': '2048px',
            },
            keyframes: {
                blink: {
                    '0%': {
                        backgroundColor: 'rgba(239, 68, 68, 0)',
                        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0)',
                    },
                    '50%': {
                        backgroundColor: 'rgba(254, 242, 242, 0.8)',
                        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.5)',
                    },
                    '100%': {
                        backgroundColor: 'rgba(239, 68, 68, 0)',
                        boxShadow: '0 0 0 2px rgba(239, 68, 68, 0)',
                    },
                },
                neutralBlink: {
                    '0%': {
                        backgroundColor: 'rgba(59, 130, 246, 0)',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0)',
                    },
                    '50%': {
                        backgroundColor: 'rgba(239, 246, 255, 0.8)',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
                    },
                    '100%': {
                        backgroundColor: 'rgba(59, 130, 246, 0)',
                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0)',
                    },
                },
            },
            animation: {
                blink: 'blink 1.2s ease-in-out 1',
                neutralBlink: 'neutralBlink 1.2s ease-in-out 1',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },

    plugins: [require('tailwindcss-animate')],
};
