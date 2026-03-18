/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primaire (Riada Blue)
        primary: {
          50: '#EBEBFF',
          100: '#D6D6FF',
          400: '#4880FF',
          500: '#3b6ee0',
          600: '#2d5ac0',
          DEFAULT: '#4880FF',
          foreground: '#ffffff',
        },
        // Succès (Teal)
        success: {
          50: '#E0F8EA',
          100: '#A7F3D0',
          400: '#00B69B',
          500: '#009980',
          600: '#007D66',
          DEFAULT: '#00B69B',
        },
        // Avertissement (Orange)
        warning: {
          50: '#FFF3D6',
          100: '#FFE5AD',
          400: '#FF9066',
          500: '#FF7F4D',
          DEFAULT: '#FF9066',
        },
        // Erreur (Rouge)
        danger: {
          50: '#FFF0F0',
          100: '#FFE0E0',
          400: '#FF4747',
          500: '#FF2E2E',
          DEFAULT: '#FF4747',
          foreground: '#ffffff',
        },
        // Neutres
        neutral: {
          50: '#F9FAFB',
          100: '#F5F6FA',
          150: '#F0F4FF',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#505050',
          700: '#374151',
          800: '#202224',
          900: '#111827',
          950: '#0F172A',
        },
        // Backgrounds
        background: '#F5F6FA',
        foreground: '#202224',
        card: '#FFFFFF',
        'card-foreground': '#202224',
        muted: '#F0F4FF',
        'muted-foreground': '#A6A6A6',
        accent: '#E9EBEF',
        'accent-foreground': '#030213',
        border: '#E0E0E0',
        input: '#F5F6FA',
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      fontSize: {
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '28px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
        DEFAULT: '0 4px 20px rgba(0, 0, 0, 0.06)',
        md: '0 4px 12px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 20px rgba(0, 0, 0, 0.15)',
        xl: '0 10px 30px rgba(15, 23, 42, 0.05)',
        '2xl': '0 15px 40px rgba(0, 0, 0, 0.2)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '300ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-in-out',
        'slide-in-up': 'slide-in-up 0.3s ease-in-out',
        'slide-in-down': 'slide-in-down 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
