/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        // 字体系统 - Mobile First
        'caption': ['0.625rem', { lineHeight: '0.875rem' }],      // 10px - 超小字：版权、细节说明
        'xs': ['0.75rem', { lineHeight: '1rem' }],                // 12px - 小字：辅助文字、标签
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],            // 14px - 次要正文
        'base': ['1rem', { lineHeight: '1.5rem' }],               // 16px - 主要正文
        'md': ['1.125rem', { lineHeight: '1.75rem' }],            // 18px - 中标题
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],             // 20px - 大标题
        'xl': ['1.5rem', { lineHeight: '2rem' }],                 // 24px - 主标题
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],           // 30px - 副大标题
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],             // 36px - 大标题
        '4xl': ['3rem', { lineHeight: '3rem' }],                  // 48px - 超大标题
        '5xl': ['3.75rem', { lineHeight: '3.75rem' }],            // 60px - 展示标题
        
        // 古风特定字号（带更宽松的行高）
        'ancient-xs': ['0.75rem', { lineHeight: '1.25rem', letterSpacing: '0.05em' }],
        'ancient-sm': ['0.875rem', { lineHeight: '1.5rem', letterSpacing: '0.05em' }],
        'ancient-base': ['1rem', { lineHeight: '1.75rem', letterSpacing: '0.1em' }],
        'ancient-lg': ['1.25rem', { lineHeight: '2rem', letterSpacing: '0.15em' }],
        'ancient-xl': ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '0.2em' }],
        'ancient-2xl': ['2rem', { lineHeight: '2.5rem', letterSpacing: '0.3em' }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}