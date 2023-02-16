export type Order = {
  orderno: string;
  date: string;
  email: string;
  status: string;
  source: 'ohmygood' | 'Shopify';
  items: Item[];
};

export type Item = {
  itemno: string;
  name: string;
  variant: string;
  image: string;
  quantity: string;
};
