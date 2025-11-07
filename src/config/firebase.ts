// Define types for our mock Firestore
interface FirestoreDocumentData {
  [key: string]: any;
}

interface FirestoreDocumentSnapshot {
  exists: boolean;
  data: () => FirestoreDocumentData | null;
  id: string;
}

interface FirestoreQuerySnapshot {
  docs: FirestoreDocumentSnapshot[];
}

interface FirestoreCollectionReference {
  doc: (id: string) => FirestoreDocumentReference;
  get: () => Promise<FirestoreQuerySnapshot>;
  add: (data: FirestoreDocumentData) => Promise<{ id: string }>;
  where: () => FirestoreQuery;
}

interface FirestoreDocumentReference {
  get: () => Promise<FirestoreDocumentSnapshot>;
  set: (data: FirestoreDocumentData) => Promise<void>;
  update: (data: FirestoreDocumentData) => Promise<void>;
  delete: () => Promise<void>;
  onSnapshot: (onNext: (snap: FirestoreDocumentSnapshot) => void) => () => void;
  collection: (collectionPath: string) => FirestoreCollectionReference;
}

interface FirestoreQuery {
  get: () => Promise<FirestoreQuerySnapshot>;
  onSnapshot: (onNext: (snap: FirestoreQuerySnapshot) => void) => () => void;
}

// Mock implementation
const mockFirestore = (): FirestoreCollectionReference => {
  const mockDoc = (id: string): FirestoreDocumentReference => ({
    get: () => Promise.resolve({
      exists: false,
      data: () => null,
      id
    }),
    set: () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    onSnapshot: (onNext) => {
      onNext({
        exists: false,
        data: () => null,
        id
      });
      return () => {}; // Unsubscribe function
    },
    collection: mockFirestore
  });

  return {
    doc: mockDoc,
    get: () => Promise.resolve({ docs: [] }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] }),
      onSnapshot: (onNext) => {
        onNext({ docs: [] });
        return () => {}; // Unsubscribe function
      }
    })
  };
};

// Export mock firestore instance
export const firestore = mockFirestore();

export default {
  firestore: () => firestore
};
