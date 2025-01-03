import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',    
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",
  ],
  plugins: [],
  safelist: [
    'border-t-red-500',
    'border-t-blue-500',
    'border-t-purple-500',
    'border-t-green-500',
    'border-t-gray-500',
    'bg-red-200', 'bg-purple-200', 
    'text-green-500', 'text-red-500', 'text-purple-500',
  ], 
}
export default config
