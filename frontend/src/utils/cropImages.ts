/**
 * Authentic Agricultural Crop Imagery Registry
 * High-resolution verified photos for Indian farm produce:
 * - Cotton (कापूस)
 * - Soybean (सोयाबीन)
 * - Wheat (गहू)
 * - Mushroom (अळंबी)
 * - Tomato (टोमॅटो)
 * - Onion (कांदा)
 * - Grapes (द्राक्षे)
 * - Maize (मका)
 * - Chickpea / Gram (हरभरा)
 */

export const CROP_IMAGES: Record<string, string> = {
  Cotton: 'https://www.renature.co/wp-content/uploads/2023/07/cotton-1.jpeg',
  Soybean: 'https://www.news-medical.net/images/news/ImageForNews_745986_16823072833517897.jpg',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
  Mushroom: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
  Tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
  Onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
  Grapes: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80',
  Banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
  Maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
  'Chickpea (Gram)': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
  Chickpea: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
  Groundnut: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&auto=format&fit=crop&q=80',
  Sugarcane: 'https://images.unsplash.com/photo-1589135233689-d56d400e9329?w=800&auto=format&fit=crop&q=80',
};

export function getCropImage(cropName: string): string {
  if (!cropName) return CROP_IMAGES['Cotton'];
  const normalized = Object.keys(CROP_IMAGES).find(
    (k) => k.toLowerCase() === cropName.toLowerCase() || cropName.toLowerCase().includes(k.toLowerCase())
  );
  return normalized ? CROP_IMAGES[normalized] : CROP_IMAGES['Cotton'];
}

/**
 * Resolves crop image URLs cleanly.
 * Converts renature web page URLs to direct image asset URLs,
 * and falls back to verified high-res assets for any unassigned crops.
 */
export function resolveCropImageUrl(url?: string | null, cropName?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getCropImage(cropName || 'Cotton');
  }
  const cleanUrl = url.trim();
  if (cleanUrl.includes('cotton-2') || cleanUrl.includes('renature.co/commodities/cotton')) {
    return 'https://www.renature.co/wp-content/uploads/2023/07/cotton-1.jpeg';
  }
  return cleanUrl;
}

/**
 * Clean image error fallback handler to prevent broken image icons
 */
export function handleImageFallback(e: React.SyntheticEvent<HTMLImageElement, Event>, cropName?: string) {
  const target = e.currentTarget;
  const fallback = getCropImage(cropName || 'Cotton');
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
