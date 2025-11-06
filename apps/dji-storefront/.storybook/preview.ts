import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "hsl( var(--background-primary) )" },
        { name: "elevated", value: "hsl( var(--background-secondary) )" },
      ],
    },
  },
};

export default preview;
