
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  material: string;
  image: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'grandparent' | 'parent' | 'spouse' | 'child' | 'sibling' | 'grandchild';
  photoUrl?: string;
  birthDate?: string;
  deathDate?: string; // Optional (if undefined/null => living)
}

export interface MemorialProfile {
  id: string;
  userId: string; // Owner of the profile (The User)
  firstName: string; // The Person
  lastName: string;
  birthDate: string;
  deathDate: string;
  bio: string;
  quote: string;
  mainPhotoUrl: string;
  galleryUrls: string[];
  candles: Candle[];
  location?: Location;
  familyTree?: FamilyMember[];
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
  bioKeywords: string;
  bio: string;
  quote: string;
  location?: Location;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  walletBalance: number;
}
