/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

    theme: {
        extend: {
            colors: {
                'button-primary-25': "#FCDFCB",
                'button-primary-50': "#F9B98D",
                'button-primary-100': '#F4802F',
                'button-primary-200': '#D2691F',
                'button-secondary-100': '#154261',
                'button-secondary-200': '#1C262D',
            },
            screens: {
                '2k': '2048px',
            },
            keyframes: {
                blink: {
                  '0%': { 
                      backgroundColor: 'rgba(244, 128, 47, 0)',
                      boxShadow: '0 0 0 2px rgba(244, 128, 47, 0)'
                  },
                  '50%': { 
                      backgroundColor: 'rgba(244, 128, 47, 0.1)', 
                      boxShadow: '0 0 0 2px rgba(244, 128, 47, 0.5)'
                  },
                  '100%': { 
                      backgroundColor: 'rgba(244, 128, 47, 0)',
                      boxShadow: '0 0 0 2px rgba(244, 128, 47, 0)'
                  }
                }
            },
            animation: {
                blink: 'blink 1.2s ease-in-out 1',
            },
        },
    },

    plugins: [],
};
