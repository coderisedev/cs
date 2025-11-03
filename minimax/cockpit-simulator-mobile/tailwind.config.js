/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class', '[data-theme="dark"]'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
				xs: '475px', // Custom extra small breakpoint
			},
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'1': '4px',
				'2': '8px',
				'3': '12px',
				'4': '16px',
				'5': '20px',
				'6': '24px',
				'8': '32px',
				'10': '40px',
				'12': '48px',
				'16': '64px',
				'20': '80px',
				'24': '96px',
				'32': '128px',
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'xs': ['12px', { lineHeight: '16px' }],
				'sm': ['14px', { lineHeight: '20px' }],
				'base': ['16px', { lineHeight: '24px' }],
				'lg': ['18px', { lineHeight: '28px' }],
				'xl': ['20px', { lineHeight: '28px' }],
				'2xl': ['24px', { lineHeight: '32px' }],
				'3xl': ['30px', { lineHeight: '36px' }],
				'4xl': ['36px', { lineHeight: '40px' }],
				'5xl': ['48px', { lineHeight: '52px' }],
				'6xl': ['64px', { lineHeight: '68px' }],
			},
			fontFamily: {
				'primary': ['Open Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
			},
			fontWeight: {
				'regular': '400',
				'medium': '500',
				'semibold': '600',
				'bold': '700',
			},
			letterSpacing: {
				'tight': '-0.02em',
				'normal': '0',
				'wide': '0.02em',
				'wider': '0.05em',
			},
			minHeight: {
				'touch': '44px',
			},
			minWidth: {
				'touch': '44px',
			},
			colors: {
				// DJI Design System Colors - Updated per analysis
				primary: {
					50: '#f0f8ff',
					100: '#e0efff',
					200: '#b8ddff',
					300: '#90cbff',
					400: '#68b9ff',
					500: '#0070d5', // DJI Brand Blue
					600: '#0056a3',
					700: '#003d71',
					800: '#00243f',
					900: '#000b0f',
					DEFAULT: '#0070d5',
					foreground: '#ffffff',
				},
				neutral: {
					50: '#ffffff', // Pure white
					100: '#fafafa', // Light gray background
					200: '#f2f2f2', // Light gray background 2
					300: '#eeeeed', // Light gray border
					400: '#ededed', // Disabled background
					500: '#919699', // Secondary text
					600: '#6c7073', // Disabled text
					700: '#616466', // Muted text
					800: '#3c3e40', // Secondary CTA button
					900: '#303233', // Primary text
				},
				background: {
					primary: 'hsl(var(--background-primary))',
					secondary: 'hsl(var(--background-secondary))',
					elevated: 'hsl(var(--background-elevated))',
					overlay: 'hsl(var(--background-overlay))',
				},
				foreground: {
					primary: 'hsl(var(--foreground-primary))',
					secondary: 'hsl(var(--foreground-secondary))',
					muted: 'hsl(var(--foreground-muted))',
				},
				semantic: {
					success: '#10b981',
					warning: '#f59e0b',
					error: '#ef4444',
					info: '#3b82f6',
				},
				// Legacy support
				border: {
					DEFAULT: 'hsl(var(--border-primary))',
					primary: 'hsl(var(--border-primary))',
					secondary: 'hsl(var(--border-secondary))',
				},
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				secondary: {
					DEFAULT: '#232323',
					foreground: '#ffffff',
				},
				accent: {
					DEFAULT: '#3b63a9',
					foreground: '#ffffff',
				},
				success: '#10b981',
				error: '#ef4444',
				warning: '#f59e0b',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			borderRadius: {
				// DJI Standard Radius System
				xs: '2px', // Small buttons, tags
				sm: '4px', // Medium elements
				base: '6px', // Large cards
				md: '8px', // Containers, navigation
				lg: '16px',
				xl: '24px',
				// DJI Capsule System
				pill: '60px',
				'pill-md': '64px',
				'pill-lg': '99px',
				'pill-xl': '999px',
				'pill-xxl': '1408px', // Primary CTA buttons
				full: '9999px',
				// Legacy support
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			boxShadow: {
				// DJI 7-Level Shadow System
				'xs': 'rgba(0, 0, 0, 0.05) 0px 2px 4px 0px', // Micro shadow - hover hints
				'sm': 'rgba(0, 0, 0, 0.1) 0px 2px 6px 0px', // Small shadow - cards, buttons
				'md': 'rgba(0, 0, 0, 0.1) 0px 8px 16px 0px', // Medium shadow - dropdowns
				'lg': 'rgba(0, 0, 0, 0.1) 0px 16px 16px 0px', // Large shadow - modals
				'xl': 'rgba(0, 0, 0, 0.1) 0px 16px 32px 0px', // Extra large shadow - popovers
				'directional': 'rgba(0, 0, 0, 0.1) 4px 4px 8px 0px', // Directional shadow
				'elevated': 'rgba(0, 0, 0, 0.2) 0px 2px 8px 0px', // Special shadow
				// Legacy support
				card: 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				modal: 'var(--shadow-modal)',
				'glow-blue': 'var(--shadow-glow-blue)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}