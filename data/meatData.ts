import { ImageSourcePropType } from 'react-native';
import MeatImages from '../assets/images';

export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export type Product = {
  id: string;
  nameKiny: string;
  nameEn: string;
  description: string;
  price: string;
  image: ImageSourcePropType;
  badge: string;
};

export const CATEGORIES: Category[] = [
  { id: 'cow',     label: 'Cow',     emoji: '🐄' },
  { id: 'goat',    label: 'Goat',    emoji: '🐐' },
  { id: 'fish',    label: 'Fish',    emoji: '🐟' },
  { id: 'chicken', label: 'Chicken', emoji: '🍗' },
];

export const PRODUCTS: Record<string, Product[]> = {
  cow: [
    {
      id: 'iroti',
      nameKiny: 'Iroti',
      nameEn: 'Meat without bones',
      description:
        'Pure boneless beef, carefully trimmed for the finest quality. Perfect for stewing, grilling, or making traditional Rwandan dishes. Sourced fresh every morning.',
      price: '2,500',
      image: MeatImages.iroti,
      badge: 'Cow • Boneless',
    },
    {
      id: 'imvange',
      nameKiny: 'Imvange',
      nameEn: 'Meat with bones',
      description:
        'Flavorful beef with bones, ideal for slow cooking and rich broths. Adds deep flavor to soups and traditional stews. A hearty choice for family meals.',
      price: '1,800',
      image: MeatImages.imvange,
      badge: 'Cow • With Bones',
    },
    {
      id: 'izo-munda',
      nameKiny: 'Izo munda',
      nameEn: 'Stomach & inside meat',
      description:
        'Fresh tripe and offal, cleaned and ready to cook. A beloved delicacy in Rwandan cuisine, rich in nutrients and deep flavor.',
      price: '1,200',
      image: MeatImages.izoMunda,
      badge: 'Cow • Offal',
    },
  ],
  goat: [
    {
      id: 'iroti-ihene',
      nameKiny: "Iroti ry'ihene",
      nameEn: 'Boneless goat meat',
      description:
        "Premium boneless goat meat with a rich, distinctive flavor. Great for grilling and slow cooking. A favourite for special occasions.",
      price: '3,000',
      image: MeatImages.irotiIhene,
      badge: 'Goat • Boneless',
    },
    {
      id: 'imvange-ihene',
      nameKiny: "Imvange y'ihene",
      nameEn: 'Goat with bones',
      description:
        'Traditional goat meat on the bone, perfect for making nyama choma and traditional stews. Rich flavor that improves with slow cooking.',
      price: '2,400',
      image: MeatImages.imvangeIhene,
      badge: 'Goat • With Bones',
    },
    {
      id: 'izo-munda-ihene',
      nameKiny: "Izo munda z'ihene",
      nameEn: 'Goat offal',
      description:
        'Fresh goat offal including liver, kidneys and intestines. A delicacy enjoyed across Rwanda, full of nutrients and distinctive flavor.',
      price: '1,500',
      image: MeatImages.izoMundaIhene,
      badge: 'Goat • Offal',
    },
  ],
  fish: [
    {
      id: 'tilapia',
      nameKiny: 'Tilapia',
      nameEn: 'Tilapia',
      description:
        'Fresh Lake Victoria Tilapia, cleaned and ready to cook. Mild flavor and tender flesh, perfect for frying, grilling, or baking.',
      price: '2,000',
      image: MeatImages.tilapia,
      badge: 'Fish • Fresh',
    },
    {
      id: 'sangara',
      nameKiny: 'Sangara',
      nameEn: 'Nile Perch',
      description:
        'Premium Nile Perch (Sangara) from Lake Kivu. Firm white flesh, great for all cooking methods. A popular choice across Rwanda.',
      price: '2,500',
      image: MeatImages.sangara,
      badge: 'Fish • Fresh',
    },
    {
      id: 'inkorayi',
      nameKiny: 'Inkorayi',
      nameEn: 'Dried Fish',
      description:
        'Sun-dried fish, a staple in Rwandan cuisine. Rich in protein and concentrated flavor, perfect for traditional recipes and sauces.',
      price: '1,800',
      image: MeatImages.inkorayi,
      badge: 'Fish • Dried',
    },
    {
      id: 'isambaza',
      nameKiny: 'Isambaza',
      nameEn: 'Small Fish',
      description:
        'Tiny lake sardines (Isambaza) from Lake Kivu. A beloved Rwandan delicacy, wonderfully crispy when fried and perfect as a side dish.',
      price: '1,200',
      image: MeatImages.isambaza,
      badge: 'Fish • Small',
    },
  ],
  chicken: [
    {
      id: 'inkoko-yose',
      nameKiny: 'Inkoko Yose',
      nameEn: 'Whole Chicken',
      description:
        'Fresh whole chicken, farm-raised and free-range. Perfect for roasting or making traditional chicken dishes for the whole family.',
      price: '4,500',
      image: MeatImages.chickenWhole,
      badge: 'Chicken • Whole',
    },
    {
      id: 'ibice',
      nameKiny: "Ibice by'inkoko",
      nameEn: 'Chicken Pieces',
      description:
        'Assorted fresh chicken pieces including thighs, drumsticks and breasts. Ideal for stewing, grilling, or your favourite chicken dish.',
      price: '3,500',
      image: MeatImages.chickenLeg,
      badge: 'Chicken • Pieces',
    },
    {
      id: 'amababa',
      nameKiny: "Amababa y'inkoko",
      nameEn: 'Chicken Wings',
      description:
        'Meaty chicken wings, perfect for grilling, frying or baking. A crowd-pleasing favourite for any occasion.',
      price: '3,000',
      image: MeatImages.chickenWings,
      badge: 'Chicken • Wings',
    },
    {
      id: 'izo-munda-inkoko',
      nameKiny: "Izo munda z'inkoko",
      nameEn: 'Chicken Offal',
      description:
        'Fresh chicken liver, gizzards and hearts. Nutritious and flavourful, great for quick dishes and traditional Rwandan recipes.',
      price: '1,500',
      image: MeatImages.chickenOffal,
      badge: 'Chicken • Offal',
    },
  ],
};

export function getProduct(categoryId: string, productId: string): Product | undefined {
  return PRODUCTS[categoryId]?.find((p) => p.id === productId);
}

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

// Home screen popular cuts
export const POPULAR_CUTS = [
  { id: 'iroti',      category: 'cow',     title: 'Iroti',         subtitle: 'Boneless Beef',   price: '2,500', image: MeatImages.iroti },
  { id: 'inkoko-yose',category: 'chicken', title: 'Inkoko Yose',   subtitle: 'Whole Chicken',   price: '4,500', image: MeatImages.chickenWhole },
  { id: 'tilapia',    category: 'fish',    title: 'Tilapia',       subtitle: 'Fresh Fish',      price: '2,000', image: MeatImages.tilapia },
  { id: 'iroti-ihene',category: 'goat',    title: "Iroti ry'ihene",subtitle: 'Boneless Goat',   price: '3,000', image: MeatImages.irotiIhene },
];

// Home screen banner image
export const BANNER_IMAGE = MeatImages.iroti;
