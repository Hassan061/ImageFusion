import { openDB, IDBPDatabase, DBSchema } from 'idb';

const DB_NAME = 'AudioCacheDB';
const STORE_NAME = 'audioBlobs';
const DB_VERSION = 1;

// Define the schema for type safety
interface AudioCacheDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string; // The name permutation text
    value: { text: string; blob: Blob }; // Store object with text and blob
  };
}

let dbPromise: Promise<IDBPDatabase<AudioCacheDBSchema>> | null = null;

// Initialize the database connection
const initDb = (): Promise<IDBPDatabase<AudioCacheDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<AudioCacheDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<AudioCacheDBSchema>) { // Explicitly type db
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'text' }); 
          console.log(`[AudioCacheDB] Object store '${STORE_NAME}' created.`);
        }
      },
    });
    console.log(`[AudioCacheDB] Database connection initiated (Name: ${DB_NAME}, Version: ${DB_VERSION}).`);
  }
  // We know dbPromise is assigned within the if block if it was null
  // Using non-null assertion, or restructure if preferred, but this is common.
  return dbPromise!;
};

// Save an audio blob to the database
export const saveAudioBlob = async (text: string, blob: Blob): Promise<void> => {
  try {
    const db = await initDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put({ text, blob }); 
    await tx.done;
    console.log(`[AudioCacheDB] Saved audio for: "${text}"`);
  } catch (error) {
    console.error(`[AudioCacheDB] Error saving audio for "${text}":`, error);
    throw error; 
  }
};

// Get an audio blob from the database by text key
export const getAudioBlob = async (text: string): Promise<Blob | null> => {
  try {
    const db = await initDb();
    // Use await for transactions if you want to ensure completion or catch errors here
    const record = await db.get(STORE_NAME, text); 
    if (record && record.blob instanceof Blob) {
       console.log(`[AudioCacheDB] Retrieved audio for: "${text}"`);
      return record.blob;
    } else {
      console.log(`[AudioCacheDB] No cached audio found for: "${text}"`);
      return null;
    }
  } catch (error) {
    console.error(`[AudioCacheDB] Error getting audio for "${text}":`, error);
    return null; // Return null on error
  }
};

// Clear all entries from the audio cache
export const clearAudioCache = async (): Promise<void> => {
  try {
    const db = await initDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.objectStore(STORE_NAME).clear(); // Can chain clear directly
    await tx.done;
    console.log(`[AudioCacheDB] Cleared all audio cache entries.`);
  } catch (error) {
    console.error(`[AudioCacheDB] Error clearing audio cache:`, error);
    throw error;
  }
};

// Get the number of items currently in the cache
export const getCacheItemCount = async (): Promise<number> => {
  try {
    const db = await initDb();
    const count = await db.count(STORE_NAME);
    console.log(`[AudioCacheDB] Cache item count: ${count}`);
    return count;
  } catch (error) {
    console.error(`[AudioCacheDB] Error getting cache count:`, error);
    return 0; // Return 0 on error
  }
}; 