import type { CategorySlug } from "./catalog";

export type NutritionFact = { label: string; value: string };

export type SeedVariant = {
  flavor: string;
  size: string;
  price: number;
  stock: number;
};

export type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: CategorySlug;
  imageUrl: string;
  gallery: string[];
  nutrition: NutritionFact[];
  ingredients: string;
  featured: boolean;
  variants: SeedVariant[];
};

const yogurNutrition: NutritionFact[] = [
  { label: "Porción", value: "100 g" },
  { label: "Energía", value: "78 kcal" },
  { label: "Proteína", value: "4.1 g" },
  { label: "Grasa total", value: "3.2 g" },
  { label: "Carbohidratos", value: "7.4 g" },
  { label: "Azúcares", value: "6.1 g" },
  { label: "Calcio", value: "140 mg" },
];

const mermeladaNutrition: NutritionFact[] = [
  { label: "Porción", value: "20 g" },
  { label: "Energía", value: "48 kcal" },
  { label: "Proteína", value: "0.2 g" },
  { label: "Grasa total", value: "0 g" },
  { label: "Carbohidratos", value: "12 g" },
  { label: "Azúcares", value: "10.5 g" },
  { label: "Fibra", value: "0.6 g" },
];

const postreNutrition: NutritionFact[] = [
  { label: "Porción", value: "120 g" },
  { label: "Energía", value: "186 kcal" },
  { label: "Proteína", value: "4.8 g" },
  { label: "Grasa total", value: "6.9 g" },
  { label: "Carbohidratos", value: "26 g" },
  { label: "Azúcares", value: "21 g" },
  { label: "Calcio", value: "160 mg" },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "yogur-natural-entero",
    name: "Yogur natural entero",
    tagline: "Fermentado 8 horas, sin azúcar añadida",
    description:
      "Nuestro yogur base: leche entera de vacas pastoreadas en la sabana y cultivos vivos fermentados durante ocho horas. Textura densa, acidez suave y cero espesantes.",
    category: "yogures",
    imageUrl: "/products/yogur-natural-entero.svg",
    gallery: [
      "/products/yogur-natural-entero.svg",
      "/products/yogur-natural-entero-2.svg",
    ],
    nutrition: yogurNutrition,
    ingredients: "Leche entera pasteurizada, cultivos lácticos vivos.",
    featured: true,
    variants: [
      { flavor: "Natural", size: "200 g", price: 6500, stock: 48 },
      { flavor: "Natural", size: "500 g", price: 13500, stock: 30 },
      { flavor: "Natural", size: "1 L", price: 22000, stock: 18 },
    ],
  },
  {
    slug: "yogur-griego-artesanal",
    name: "Yogur griego artesanal",
    tagline: "Colado tres veces, 9 g de proteína",
    description:
      "Yogur colado tres veces hasta lograr una textura de crema batida. Alto en proteína y perfecto con nuestras mermeladas de finca.",
    category: "yogures",
    imageUrl: "/products/yogur-griego-artesanal.svg",
    gallery: [
      "/products/yogur-griego-artesanal.svg",
      "/products/yogur-griego-artesanal-2.svg",
    ],
    nutrition: [
      { label: "Porción", value: "100 g" },
      { label: "Energía", value: "97 kcal" },
      { label: "Proteína", value: "9.0 g" },
      { label: "Grasa total", value: "5.0 g" },
      { label: "Carbohidratos", value: "4.0 g" },
      { label: "Azúcares", value: "3.6 g" },
      { label: "Calcio", value: "150 mg" },
    ],
    ingredients: "Leche entera pasteurizada, crema de leche, cultivos lácticos vivos.",
    featured: true,
    variants: [
      { flavor: "Natural", size: "150 g", price: 8900, stock: 40 },
      { flavor: "Natural", size: "500 g", price: 24500, stock: 22 },
      { flavor: "Mora", size: "150 g", price: 9500, stock: 26 },
      { flavor: "Maracuyá", size: "150 g", price: 9500, stock: 0 },
    ],
  },
  {
    slug: "yogur-de-mora-de-castilla",
    name: "Yogur de mora de Castilla",
    tagline: "Con pulpa fresca, sin colorantes",
    description:
      "Mora de Castilla despulpada el mismo día y mezclada con nuestro yogur base. Se separa un poco en el frasco: eso es señal de que no lleva estabilizantes.",
    category: "yogures",
    imageUrl: "/products/yogur-de-mora-de-castilla.svg",
    gallery: ["/products/yogur-de-mora-de-castilla.svg"],
    nutrition: yogurNutrition,
    ingredients:
      "Leche entera pasteurizada, pulpa de mora de Castilla, panela, cultivos lácticos vivos.",
    featured: true,
    variants: [
      { flavor: "Mora", size: "200 g", price: 7500, stock: 36 },
      { flavor: "Mora", size: "1 L", price: 25000, stock: 12 },
    ],
  },
  {
    slug: "yogur-de-vainilla-y-panela",
    name: "Yogur de vainilla y panela",
    tagline: "Endulzado solo con panela de Villeta",
    description:
      "Vainilla natural infusionada en leche tibia y panela pulverizada como único endulzante. El favorito de los niños de la casa.",
    category: "yogures",
    imageUrl: "/products/yogur-de-vainilla-y-panela.svg",
    gallery: ["/products/yogur-de-vainilla-y-panela.svg"],
    nutrition: yogurNutrition,
    ingredients:
      "Leche entera pasteurizada, panela, extracto natural de vainilla, cultivos lácticos vivos.",
    featured: false,
    variants: [
      { flavor: "Vainilla", size: "200 g", price: 7200, stock: 44 },
      { flavor: "Vainilla", size: "1 L", price: 24000, stock: 15 },
    ],
  },
  {
    slug: "kumis-de-la-casa",
    name: "Kumis de la casa",
    tagline: "Receta de la abuela, bien espeso",
    description:
      "Kumis fermentado en frasco de vidrio, espeso y ligeramente dulce. Se sirve helado, idealmente con un pandebono recién horneado.",
    category: "yogures",
    imageUrl: "/products/kumis-de-la-casa.svg",
    gallery: ["/products/kumis-de-la-casa.svg"],
    nutrition: yogurNutrition,
    ingredients: "Leche entera pasteurizada, azúcar de caña, cultivos lácticos vivos.",
    featured: false,
    variants: [
      { flavor: "Tradicional", size: "250 g", price: 7000, stock: 28 },
      { flavor: "Tradicional", size: "1 L", price: 23000, stock: 9 },
    ],
  },
  {
    slug: "mermelada-de-mora",
    name: "Mermelada de mora",
    tagline: "70% fruta, cocida en olla de cobre",
    description:
      "Mora de Castilla cocida lentamente con azúcar de caña y jugo de limón. Sin pectina industrial ni conservantes: la textura la da la fruta.",
    category: "mermeladas",
    imageUrl: "/products/mermelada-de-mora.svg",
    gallery: ["/products/mermelada-de-mora.svg", "/products/mermelada-de-mora-2.svg"],
    nutrition: mermeladaNutrition,
    ingredients: "Mora de Castilla (70%), azúcar de caña, jugo de limón.",
    featured: true,
    variants: [
      { flavor: "Mora", size: "150 g", price: 12000, stock: 34 },
      { flavor: "Mora", size: "300 g", price: 21000, stock: 20 },
    ],
  },
  {
    slug: "mermelada-de-fresa",
    name: "Mermelada de fresa",
    tagline: "Fresa de Sibaté en trozos",
    description:
      "Trozos generosos de fresa que se sienten en cada cucharada. Ideal sobre yogur griego o con queso costeño.",
    category: "mermeladas",
    imageUrl: "/products/mermelada-de-fresa.svg",
    gallery: ["/products/mermelada-de-fresa.svg"],
    nutrition: mermeladaNutrition,
    ingredients: "Fresa (68%), azúcar de caña, jugo de limón.",
    featured: false,
    variants: [
      { flavor: "Fresa", size: "150 g", price: 11500, stock: 30 },
      { flavor: "Fresa", size: "300 g", price: 20000, stock: 16 },
    ],
  },
  {
    slug: "mermelada-de-pina-y-maracuya",
    name: "Mermelada de piña y maracuyá",
    tagline: "Ácida, tropical, sin colorantes",
    description:
      "Piña oro miel y maracuyá del Huila en una mermelada ácida y muy aromática. Excelente con quesos maduros y sobre cuchareables.",
    category: "mermeladas",
    imageUrl: "/products/mermelada-de-pina-y-maracuya.svg",
    gallery: ["/products/mermelada-de-pina-y-maracuya.svg"],
    nutrition: mermeladaNutrition,
    ingredients: "Piña (45%), maracuyá (23%), azúcar de caña, jugo de limón.",
    featured: true,
    variants: [
      { flavor: "Piña y maracuyá", size: "150 g", price: 12500, stock: 24 },
      { flavor: "Piña y maracuyá", size: "300 g", price: 22000, stock: 0 },
    ],
  },
  {
    slug: "mermelada-de-agraz-y-vainilla",
    name: "Mermelada de agraz y vainilla",
    tagline: "Edición limitada de temporada",
    description:
      "Agraz silvestre de Boyacá con una vaina de vainilla entera por olla. Producción pequeña, sale solo unas semanas al año.",
    category: "mermeladas",
    imageUrl: "/products/mermelada-de-agraz-y-vainilla.svg",
    gallery: ["/products/mermelada-de-agraz-y-vainilla.svg"],
    nutrition: mermeladaNutrition,
    ingredients: "Agraz (65%), azúcar de caña, vainilla natural, jugo de limón.",
    featured: false,
    variants: [{ flavor: "Agraz", size: "150 g", price: 16000, stock: 11 }],
  },
  {
    slug: "arroz-con-leche-cremoso",
    name: "Arroz con leche cremoso",
    tagline: "Canela en rama y leche entera",
    description:
      "Arroz cocido a fuego bajo en leche entera con canela en rama y cáscara de limón. Se sirve frío, directo del vaso.",
    category: "cuchareables",
    imageUrl: "/products/arroz-con-leche-cremoso.svg",
    gallery: ["/products/arroz-con-leche-cremoso.svg"],
    nutrition: postreNutrition,
    ingredients:
      "Leche entera, arroz, azúcar de caña, canela, cáscara de limón, pasas.",
    featured: true,
    variants: [
      { flavor: "Tradicional", size: "120 g", price: 9000, stock: 26 },
      { flavor: "Tradicional", size: "250 g", price: 16000, stock: 14 },
    ],
  },
  {
    slug: "postre-de-natas",
    name: "Postre de natas",
    tagline: "Con brevas caladas encima",
    description:
      "El clásico postre de natas colombiano, hecho con la nata de nuestra propia leche y coronado con brevas caladas en almíbar de panela.",
    category: "cuchareables",
    imageUrl: "/products/postre-de-natas.svg",
    gallery: ["/products/postre-de-natas.svg", "/products/postre-de-natas-2.svg"],
    nutrition: postreNutrition,
    ingredients:
      "Nata de leche, leche entera, azúcar de caña, brevas caladas, canela.",
    featured: true,
    variants: [
      { flavor: "Brevas", size: "120 g", price: 11000, stock: 20 },
      { flavor: "Sin brevas", size: "120 g", price: 10000, stock: 18 },
    ],
  },
  {
    slug: "cheesecake-de-mora-en-vaso",
    name: "Cheesecake de mora en vaso",
    tagline: "Base de galleta y salsa de mora",
    description:
      "Capas de galleta con mantequilla, crema de queso batida y salsa de mora hecha con nuestra mermelada. Listo para llevar en vaso de vidrio.",
    category: "cuchareables",
    imageUrl: "/products/cheesecake-de-mora-en-vaso.svg",
    gallery: ["/products/cheesecake-de-mora-en-vaso.svg"],
    nutrition: postreNutrition,
    ingredients:
      "Queso crema, crema de leche, galleta de mantequilla, azúcar de caña, mermelada de mora.",
    featured: false,
    variants: [
      { flavor: "Mora", size: "130 g", price: 13000, stock: 22 },
      { flavor: "Maracuyá", size: "130 g", price: 13000, stock: 17 },
    ],
  },
];
