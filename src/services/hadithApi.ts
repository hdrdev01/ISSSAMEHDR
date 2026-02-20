import localforage from 'localforage';
import type { Edition, Hadith, CacheData } from '@/types';

const API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// Initialize localforage instances
const cacheStore = localforage.createInstance({
  name: 'hadith-cache',
  storeName: 'hadiths',
});

const editionsStore = localforage.createInstance({
  name: 'hadith-cache',
  storeName: 'editions',
});

const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface EditionsResponse {
  [key: string]: {
    collection: string;
    language: string;
    englishName: string;
    sectionNumber: number;
    hadithCount: number;
  };
}

interface HadithsResponse {
  hadiths: Hadith[];
}

interface Metadata {
  metadata: {
    sections: Record<string, string>;
  };
}

async function fetchWithCache<T>(
  url: string,
  store: LocalForage,
  key: string
): Promise<T> {
  // Check cache first
  const cached = await store.getItem<CacheData<T>>(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  // Fetch from API
  const response = await fetch(url);
  if (!response.ok) {
    // Try .min.json fallback
    const minUrl = url.replace('.json', '.min.json');
    const minResponse = await fetch(minUrl);
    if (!minResponse.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    const data = await minResponse.json();
    
    // Cache the data
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_EXPIRY,
    };
    await store.setItem(key, cacheData);
    return data;
  }

  const data = await response.json();
  
  // Cache the data
  const cacheData: CacheData<T> = {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + CACHE_EXPIRY,
  };
  await store.setItem(key, cacheData);
  
  return data;
}

export async function fetchEditions(): Promise<Edition[]> {
  const url = `${API_BASE}/editions.json`;
  const key = 'editions';
  
  try {
    const response = await fetchWithCache<EditionsResponse>(url, editionsStore, key);
    
    return Object.entries(response).map(([name, info]) => ({
      name,
      book: info.collection,
      language: info.language,
      englishName: info.englishName,
      sectionNumber: info.sectionNumber,
      hadithCount: info.hadithCount,
    }));
  } catch {
    // Check if we have cached data even if expired
    const cached = await editionsStore.getItem<CacheData<EditionsResponse>>(key);
    if (cached) {
      return Object.entries(cached.data).map(([name, info]) => ({
        name,
        book: info.collection,
        language: info.language,
        englishName: info.englishName,
        sectionNumber: info.sectionNumber,
        hadithCount: info.hadithCount,
      }));
    }
    return [];
  }
}

export async function fetchHadiths(editionName: string): Promise<Hadith[]> {
  const url = `${API_BASE}/editions/${editionName}.json`;
  const key = `hadiths_${editionName}`;
  
  try {
    const response = await fetchWithCache<HadithsResponse>(url, cacheStore, key);
    return response.hadiths;
  } catch {
    // Check for expired cache
    const cached = await cacheStore.getItem<CacheData<HadithsResponse>>(key);
    if (cached) {
      return cached.data.hadiths;
    }
    return [];
  }
}

export async function fetchHadith(editionName: string, hadithNumber: number): Promise<Hadith | null> {
  const hadiths = await fetchHadiths(editionName);
  return hadiths.find(h => h.hadithnumber === hadithNumber) || null;
}

export async function fetchSections(editionName: string): Promise<Record<string, string>> {
  const url = `${API_BASE}/editions/${editionName}/metadata.json`;
  const key = `sections_${editionName}`;
  
  try {
    const response = await fetchWithCache<Metadata>(url, cacheStore, key);
    return response.metadata?.sections || {};
  } catch {
    const cached = await cacheStore.getItem<CacheData<Metadata>>(key);
    if (cached) {
      return cached.data.metadata?.sections || {};
    }
    return {};
  }
}

export function groupEditionsByBook(editions: Edition[]): Map<string, Edition[]> {
  const groups = new Map<string, Edition[]>();
  
  for (const edition of editions) {
    const existing = groups.get(edition.book) || [];
    existing.push(edition);
    groups.set(edition.book, existing);
  }
  
  return groups;
}

export function getLanguageForEdition(editionName: string): string {
  const parts = editionName.split('-');
  return parts[parts.length - 1] || 'en';
}

export function getBookShortName(bookName: string): string {
  const shortNames: Record<string, string> = {
    'bukhari': 'Bukhari',
    'muslim': 'Muslim',
    'abudawud': 'Abu Dawud',
    'tirmidhi': 'Tirmidhi',
    'nasai': "Nasa'i",
    'ibnmajah': 'Ibn Majah',
    'malik': 'Malik',
    'ahmad': 'Ahmad',
    'darimi': 'Darimi',
    'nawawi': 'Nawawi',
    'shamail': 'Shamail',
    'adab': 'Adab',
    'hisn': 'Hisn',
    'mishkat': 'Mishkat',
    'bulugh': 'Bulugh',
    'riyadussalihin': 'Riyad us-Salihin',
  };
  
  return shortNames[bookName.toLowerCase()] || bookName;
}
