const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
   theme: {
    extend: {
      colors: {
        municipal: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#f59e0b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      },
    },
  },
};

export default config;
