export type CategoryId = "liquid" | "soluble" | "suspension" | "raw";

export type Category = {
  id: CategoryId;
  name: string;
  nameEn: string;
  short: string;
  description: string;
  image: string;
};

export type SpecRow = { label: string; value: string };

export type Product = {
  slug: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  npk?: string;
  tagline: string;
  /** null = price on request (B2B quote flow) */
  price: number | null;
  unit?: string;
  sizes: string[];
  composition: SpecRow[];
  features: string[];
  usage: SpecRow[];
  image?: string;
  featured?: boolean;
  origin?: string;
};

export type CartLine = {
  slug: string;
  /** لقطة من الاسم وقت الإضافة — حتى لا تعتمد السلة على الكتالوج */
  name: string;
  image?: string;
  size: string;
  qty: number;
};
