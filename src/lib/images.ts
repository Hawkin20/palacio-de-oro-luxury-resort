/**
 * Curated Luxury Resort Photography Registry for Palacio de Oro
 * High-resolution, architectural & hospitality photography
 */

export const LUXURY_FALLBACK_IMAGES = {
  // Specific Accommodations (Unique non-repeating images)
  standardRoom: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  deluxeRoom: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  suitePremium: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
  villaDeLujo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
  cabanaPequena: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  cabanaFamiliar: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85',
  cabanaBarkada: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85',

  // General Defaults
  room: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  luxurySuite: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
  cottage: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  resortHero: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85',
  poolOcean: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85',
  dining: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
  cocktail: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=85',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=85',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

/**
 * Returns a specific, non-repeating fallback image based on the item name or type.
 */
export const getAccommodationFallback = (name?: string, type?: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('est') || n.includes('stand')) return LUXURY_FALLBACK_IMAGES.standardRoom;
  if (n.includes('deluxe')) return LUXURY_FALLBACK_IMAGES.deluxeRoom;
  if (n.includes('suite')) return LUXURY_FALLBACK_IMAGES.suitePremium;
  if (n.includes('villa')) return LUXURY_FALLBACK_IMAGES.villaDeLujo;
  if (n.includes('peque') || n.includes('small')) return LUXURY_FALLBACK_IMAGES.cabanaPequena;
  if (n.includes('famil')) return LUXURY_FALLBACK_IMAGES.cabanaFamiliar;
  if (n.includes('barkada') || n.includes('group')) return LUXURY_FALLBACK_IMAGES.cabanaBarkada;
  return type === 'cottage' ? LUXURY_FALLBACK_IMAGES.cottage : LUXURY_FALLBACK_IMAGES.room;
};

/**
 * Attaches a graceful fallback when an image fails to load.
 * Prevents infinite loop by unsetting onError after replacement.
 */
export const handleImageFallback = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackTypeOrName: keyof typeof LUXURY_FALLBACK_IMAGES | string = 'room',
  type?: string
) => {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite error loops
  if (fallbackTypeOrName in LUXURY_FALLBACK_IMAGES) {
    target.src = LUXURY_FALLBACK_IMAGES[fallbackTypeOrName as keyof typeof LUXURY_FALLBACK_IMAGES];
  } else {
    target.src = getAccommodationFallback(fallbackTypeOrName, type);
  }
};
