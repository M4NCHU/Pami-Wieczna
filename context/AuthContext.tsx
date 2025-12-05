
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MemorialProfile } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  users: User[]; // For admin view
  profiles: MemorialProfile[]; // All profiles
  addProfile: (profile: MemorialProfile) => void;
  updateProfile: (profile: MemorialProfile) => void; // Added update capability
  updateBalance: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users
const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', role: 'admin', walletBalance: 5000.00 },
  { id: '2', username: 'user', role: 'user', walletBalance: 250.00 },
  { id: '3', username: 'jan_nowak', role: 'user', walletBalance: 1450.00 },
];

// Helper to generate a large family tree with dates
const largeFamilyTree = [
  // Grandparents (Generation -2)
  { id: 'gp1', name: 'Józef Nowak', relation: 'grandparent' as const, birthDate: '1890', deathDate: '1965', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
  { id: 'gp2', name: 'Helena Nowak', relation: 'grandparent' as const, birthDate: '1895', deathDate: '1970' },
  { id: 'gp3', name: 'Franciszek Kowal', relation: 'grandparent' as const, birthDate: '1888', deathDate: '1960' },
  { id: 'gp4', name: 'Rozalia Kowal', relation: 'grandparent' as const, birthDate: '1900', deathDate: '1985' },
  
  // Parents (Generation -1)
  { id: 'p1', name: 'Tadeusz Nowak', relation: 'parent' as const, birthDate: '1920', deathDate: '1995', photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
  { id: 'p2', name: 'Jadwiga Nowak', relation: 'parent' as const, birthDate: '1922', deathDate: '2005' },

  // Spouse & Siblings (Generation 0)
  { id: 's1', name: 'Maria Nowak', relation: 'spouse' as const, birthDate: '1940', deathDate: '2018', photoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop' },
  { id: 'sib1', name: 'Krzysztof Nowak', relation: 'sibling' as const, birthDate: '1942', deathDate: '' }, // Living
  { id: 'sib2', name: 'Elżbieta Wiśniewska', relation: 'sibling' as const, birthDate: '1945', deathDate: '' }, // Living
  { id: 'sib3', name: 'Andrzej Nowak', relation: 'sibling' as const, birthDate: '1936', deathDate: '2010' },

  // Children (Generation +1)
  { id: 'c1', name: 'Marek Nowak', relation: 'child' as const, birthDate: '1965', deathDate: '' },
  { id: 'c2', name: 'Ewa Zielińska', relation: 'child' as const, birthDate: '1968', deathDate: '' },
  { id: 'c3', name: 'Piotr Nowak', relation: 'child' as const, birthDate: '1972', deathDate: '' },
  { id: 'c4', name: 'Anna Lewandowska', relation: 'child' as const, birthDate: '1975', deathDate: '' },

  // Grandchildren (Generation +2)
  { id: 'gc1', name: 'Tomek Nowak', relation: 'grandchild' as const, birthDate: '1995', deathDate: '' },
  { id: 'gc2', name: 'Kasia Nowak', relation: 'grandchild' as const, birthDate: '1998', deathDate: '' },
  { id: 'gc3', name: 'Michał Zieliński', relation: 'grandchild' as const, birthDate: '2000', deathDate: '' },
  { id: 'gc4', name: 'Ola Zielińska', relation: 'grandchild' as const, birthDate: '2002', deathDate: '' },
  { id: 'gc5', name: 'Kuba Lewandowski', relation: 'grandchild' as const, birthDate: '2005', deathDate: '' },
  { id: 'gc6', name: 'Maja Lewandowska', relation: 'grandchild' as const, birthDate: '2008', deathDate: '' },
];

const MOCK_PROFILES: MemorialProfile[] = [
  // Admin Demo Profile
  {
    id: 'demo',
    userId: '1', 
    firstName: 'Jan',
    lastName: 'Kowalski',
    birthDate: '1945-03-12',
    deathDate: '2023-11-20',
    quote: "Nie umiera ten, kto trwa w pamięci żywych.",
    bio: "Jan był człowiekiem niezwykłego serca i niespożytej energii. Całe życie poświęcił rodzinie, będąc oparciem dla żony Ewy i dzieci. \n\nJego pasją było stolarstwo – potrafił wyczarować z drewna prawdziwe cuda, które do dziś zdobią domy przyjaciół. Uwielbiał góry, a każdą wolną chwilę spędzał na szlakach Tatr, ucząc wnuki szacunku do przyrody. \n\nZawsze uśmiechnięty, z dobrym słowem dla każdego. Odszedł spokojnie, pozostawiając po sobie pustkę, której nic nie wypełni, ale i piękne wspomnienia, które ogrzewają serca.",
    mainPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=988&auto=format&fit=crop',
    headstoneUrl: 'https://img.freepik.com/darmowe-zdjecie/widok-grobow-na-cmentarzu_23-2149435512.jpg',
    galleryUrls: [],
    candles: [
      { id: '1', name: 'Anna', message: 'Tęsknimy.', date: '2023-12-24' }
    ],
    location: { lat: 52.2297, lng: 21.0122 }, 
    familyTree: [
      { id: 'f1', name: 'Stanisław Kowalski', relation: 'parent', birthDate: '1920', deathDate: '1990' },
      { id: 'f2', name: 'Maria Kowalska', relation: 'parent', birthDate: '1922', deathDate: '2001' },
      { id: 'f3', name: 'Ewa Kowalska', relation: 'spouse', birthDate: '1948', deathDate: '' },
    ]
  },
  // Jan Nowak's Profiles
  {
    id: 'antoni-nowak',
    userId: '3', 
    firstName: 'Antoni',
    lastName: 'Nowak',
    birthDate: '1938-05-15',
    deathDate: '2015-02-10',
    quote: "Rodzina jest najważniejsza.",
    bio: "Antoni był nestorem rodu Nowaków. Przez 40 lat pracował jako inżynier budownictwa, wznosząc mosty, które łączą ludzi do dziś. \n\nBył człowiekiem zasad, ale o gołębim sercu. Niedzielne obiady u dziadka Antoniego były tradycją, której nikt nie śmiał opuścić. Jego opowieści o dawnych czasach fascynowały kolejne pokolenia.",
    mainPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop',
    headstoneUrl: 'https://img.freepik.com/darmowe-zdjecie/widok-grobow-na-cmentarzu_23-2149435512.jpg',
    galleryUrls: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop'
    ],
    candles: [],
    location: { lat: 50.0647, lng: 19.9450 },
    familyTree: largeFamilyTree
  },
  {
    id: 'maria-nowak',
    userId: '3',
    firstName: 'Maria',
    lastName: 'Nowak',
    birthDate: '1940-08-20',
    deathDate: '2018-11-05',
    quote: "Miłość nigdy nie ustaje.",
    bio: "Maria, ukochana żona Antoniego. Kobieta ciepła, pełna empatii, która stworzyła prawdziwy dom dla swojej licznej rodziny.",
    mainPhotoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop',
    headstoneUrl: 'https://img.freepik.com/darmowe-zdjecie/widok-grobow-na-cmentarzu_23-2149435512.jpg',
    galleryUrls: [],
    candles: [],
    location: { lat: 50.0647, lng: 19.9450 },
    familyTree: [
        { id: 'mn1', name: 'Antoni Nowak', relation: 'spouse', birthDate: '1938', deathDate: '2015' },
        { id: 'mn2', name: 'Marek Nowak', relation: 'child', birthDate: '1965', deathDate: '' },
        { id: 'mn3', name: 'Ewa Zielińska', relation: 'child', birthDate: '1968', deathDate: '' }
    ]
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [profiles, setProfiles] = useState<MemorialProfile[]>(MOCK_PROFILES);

  const login = (username: string) => {
    const foundUser = users.find(u => u.username === username);
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert("Użytkownik nie istnieje. Dostępne konta: admin, user, jan_nowak");
    }
  };

  const logout = () => setUser(null);

  const addProfile = (profile: MemorialProfile) => {
    setProfiles(prev => [...prev, profile]);
  };

  const updateProfile = (updatedProfile: MemorialProfile) => {
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const updateBalance = (amount: number) => {
    if (!user) return;
    const newBalance = user.walletBalance + amount;
    const updatedUser = { ...user, walletBalance: newBalance };
    setUser(updatedUser);
    
    // Update in users array as well
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, users, profiles, addProfile, updateProfile, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
