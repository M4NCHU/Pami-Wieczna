export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  material: string;
  image: string;
}

export interface MemorialProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate: string;
  bio: string;
  quote: string;
  mainPhotoUrl: string;
  galleryUrls: string[];
  candles: Candle[];
}

export interface Candle {
  id: string;
  name: string;
  message: string;
  date: string;
}

export interface OrderFormData {
  productId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  deathDate: string;
  bioKeywords: string; // Used for AI generation
  bio: string;
  quote: string;
}