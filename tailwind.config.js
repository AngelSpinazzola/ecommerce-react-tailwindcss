/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'ui-sans-serif', 'system-ui']
      },
      // 🎨 PALETA NOVA GAMING
      colors: {
        nova: {
          // Colores principales
          cyan: '#22d3ee',
          indigo: '#818cf8', 
          purple: '#c084fc',
          
          // Colores de apoyo
          'cyan-dark': '#06b6d4',
          blue: '#3b82f6',
          'purple-dark': '#9333ea',
          
          // Neutros
          black: '#000000',
          white: '#ffffff',
          'gray-900': '#111827',
          'gray-800': '#1f2937',
          'gray-700': '#374151',
          'gray-400': '#9ca3af',
        }
      },
      backgroundImage: {
        // Gradientes NOVA
        'nova-primary': 'linear-gradient(to right, #22d3ee, #c084fc)',
        'nova-text': 'linear-gradient(to right, #ffffff, #22d3ee)',
        'nova-button': 'linear-gradient(to right, #06b6d4, #9333ea)',
        'nova-subtle': 'linear-gradient(to right, rgba(34, 211, 238, 0.1), rgba(192, 132, 252, 0.1))',
        'nova-glow': 'linear-gradient(45deg, #22d3ee, #818cf8, #c084fc)',
      },
      boxShadow: {
        // Sombras NOVA
        'nova-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'nova-purple': '0 0 20px rgba(192, 132, 252, 0.3)',
        'nova-glow': '0 0 15px rgba(34, 211, 238, 0.4)',
        'nova-border': '0 0 10px rgba(34, 211, 238, 0.2)',
      },
      animation: {
        'nova-pulse': 'nova-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nova-glow': 'nova-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'nova-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'nova-glow': {
          '0%': { boxShadow: '0 0 5px rgba(34, 211, 238, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}