import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { PATTERNS as HARDCODED_PATTERNS } from '../data/patterns';

/**
 * Live patterns from Firestore. While the first fetch is in flight,
 * we serve the hardcoded list so the Library never appears blank.
 * If Firestore returns zero patterns (collection not seeded yet),
 * we also fall back to hardcoded so users still see content.
 */
export function usePatterns() {
  const [patterns, setPatterns] = useState(HARDCODED_PATTERNS);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'patterns'),
      snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs.length > 0) {
          setPatterns(docs);
        } else {
          // Collection exists but is empty — keep hardcoded as fallback
          setPatterns(HARDCODED_PATTERNS);
        }
        setLoading(false);
      },
      err => {
        // On any error, just use hardcoded data so the app stays usable
        console.warn('Patterns fetch failed, using fallback:', err.message);
        setPatterns(HARDCODED_PATTERNS);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { patterns, loading };
}