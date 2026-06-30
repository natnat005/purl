import { useState, useEffect } from 'react';

// ⚠️ Paste your Pexels API key here
// Get it free at pexels.com/api
const PEXELS_KEY = 'your_pexels_api_key_here';

// Cache so we don't refetch the same query
const cache = {};

// Craft-specific search queries for each pattern
const QUERIES = {
  c1:  'crochet beanie hat',
  c2:  'granny square crochet',
  c3:  'crochet dishcloth cotton',
  c4:  'crochet coasters handmade',
  c5:  'crochet tote bag',
  c6:  'crochet blanket colorful',
  c7:  'amigurumi teddy bear crochet',
  c8:  'crochet cardigan handmade',
  c9:  'crochet mandala wall art',
  c10: 'crochet lace shawl',
  c11: 'crochet bucket hat',
  c12: 'macrame plant hanger',
  c13: 'crochet socks handmade',
  c14: 'granny square cardigan',
  k1:  'knitting scarf wool',
  k2:  'knitting dishcloth',
  k3:  'knitted headband',
  k4:  'knitted cowl scarf',
  k5:  'cable knit hat beanie',
  k6:  'hand knitted socks',
  k7:  'fair isle mittens colorwork',
  k8:  'hand knitted sweater',
  k9:  'aran cable knit sweater',
  k10: 'lace knitting shawl',
  k11: 'brioche knitting scarf',
  s1:  'handmade fabric tote bag',
  s2:  'handmade pillowcase sewing',
  s3:  'fabric scrunchie handmade',
  s4:  'drawstring bag handmade',
  s5:  'zipper pouch handmade sewing',
  s6:  'handmade skirt sewing',
  s7:  'quilted potholder handmade',
  s8:  'zipper pouch lined fabric',
  s9:  'linen trousers handmade',
  s10: 'quilted bag handmade',
  s11: 'tailored blazer sewing',
  s12: 'wrap dress handmade',
};

async function fetchPhoto(query) {
  if (!PEXELS_KEY || PEXELS_KEY === 'your_pexels_api_key_here') return null;
  if (cache[query]) return cache[query];

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const data = await res.json();
    const photo = data.photos?.[0]?.src?.medium || null;
    if (photo) cache[query] = photo;
    return photo;
  } catch (e) {
    return null;
  }
}

// Hook for a single pattern
export function usePexelsPhoto(patternId) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const query = QUERIES[patternId];
    if (!query) return;
    fetchPhoto(query).then(setUrl);
  }, [patternId]);

  return url;
}

// Preload all photos at app start (call once in App.js)
export async function preloadAllPhotos() {
  const results = {};
  const ids = Object.keys(QUERIES);
  // Fetch in batches of 5 to avoid rate limiting
  for (let i = 0; i < ids.length; i += 5) {
    const batch = ids.slice(i, i + 5);
    await Promise.all(batch.map(async id => {
      const url = await fetchPhoto(QUERIES[id]);
      if (url) results[id] = url;
    }));
    // Small delay between batches
    if (i + 5 < ids.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return results;
}

export { QUERIES };