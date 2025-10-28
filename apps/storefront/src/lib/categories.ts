export type Category = { name: string; handles: string[] }
const categories: Record<string, Category> = {
  apparel: {
    name: 'Apparel',
    handles: ['tshirt', 'sweatshirt', 'shorts'],
  },
}

export default categories
