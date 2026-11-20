/**
 * Curated Luxury Resort Fallback Images for Palacio de Oro
 * High-resolution, reliable Unsplash architectural & hospitality photography
 */

export const LUXURY_FALLBACK_IMAGES = {
  room: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
  luxurySuite: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
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
 * Attaches a graceful fallback when an image fails to load.
 * Prevents infinite loop by unsetting onError after replacement.
 */
export const handleImageFallback = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackType: keyof typeof LUXURY_FALLBACK_IMAGES = 'room'
) => {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite error loops
  target.src = LUXURY_FALLBACK_IMAGES[fallbackType] || LUXURY_FALLBACK_IMAGES.room;
};
