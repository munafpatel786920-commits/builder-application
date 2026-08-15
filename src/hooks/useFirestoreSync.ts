import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

function getCleanFallbackDoc<T>(collectionName: string, initialData: T, user: any): T {
  if (user && user.isApprovedCustomer) {
    if (collectionName === 'profile') {
      return {
        ...initialData,
        companyName: user.displayName ? `${user.displayName}` : 'My Builder Group',
        address: '',
        directorName: user.displayName || 'Managing Director',
        state: '',
        city: '',
        phoneNo: user.phoneNumber || '',
        gstNo: '',
        logoUrl: '',
        pettyCashFund: 0
      } as unknown as T;
    }
  }
  return initialData;
}

export function useFirestoreSync<T extends { id: string }>(
  collectionName: string,
  initialLocalData: T[],
  user: any
) {
  const [data, setData] = useState<T[]>([]);
  const isInitialLoad = useRef(true);

  // Use refs for the non-primitive array to prevent triggering effect on reference changes
  const initialLocalDataRef = useRef(initialLocalData);
  useEffect(() => {
    initialLocalDataRef.current = initialLocalData;
  }, [initialLocalData]);

  // Listen from Firestore / LocalStorage (Sandbox)
  useEffect(() => {
    if (!user || user.isSandbox) {
      const saved = localStorage.getItem(`sandbox_${collectionName}`);
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (e) {
          setData(initialLocalDataRef.current);
        }
      } else {
        setData(initialLocalDataRef.current);
      }
      return;
    }

    const q = query(collection(db, collectionName), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnapshot) => {
        items.push(docSnapshot.data() as T);
      });
      
      // If Firestore is empty and it's our first time loading, seed data only for sandbox/local users
      if (items.length === 0 && isInitialLoad.current) {
        isInitialLoad.current = false;
        if (user && !user.isSandbox) {
          setData([]); // Clean slate for real registered customers (no sample data)
        } else {
          setData(initialLocalDataRef.current);
        }
      } else {
        isInitialLoad.current = false;
        setData(items);
      }
    }, (error) => {
      console.warn(`Firestore sync error on ${collectionName}: ${error.message}. Returning empty or local fallback.`);
      if (user && !user.isSandbox) {
        setData([]);
      } else {
        setData(initialLocalDataRef.current);
      }
    });

    return () => unsubscribe();
  }, [collectionName, user?.uid, user?.isSandbox]);

  // Writer function to set data
  const updateData = async (value: React.SetStateAction<T[]>) => {
    // If not logged in or in sandbox, update state locally (and persist to localStorage for Sandbox)
    if (!user || user.isSandbox) {
      setData(prevState => {
        const resolved = typeof value === 'function' ? (value as any)(prevState) : value;
        if (user && user.isSandbox) {
          localStorage.setItem(`sandbox_${collectionName}`, JSON.stringify(resolved));
        }
        return resolved;
      });
      return;
    }

    // Resolve next state
    const resolved = typeof value === 'function' ? (value as any)(data) : value;
    const resolvedIds = new Set(resolved.map((item: T) => item.id));
    const deletedItems = data.filter(item => !resolvedIds.has(item.id));

    // Optimistic UI updates
    setData(resolved);

    try {
      // 1. Delete items deleted locally from Firestore
      for (const item of deletedItems) {
        await deleteDoc(doc(db, collectionName, item.id))
          .catch(err => handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${item.id}`));
      }

      // 2. Add or update item payloads in Firestore
      for (const item of resolved) {
        const payload = { ...item, userId: user.uid };
        await setDoc(doc(db, collectionName, item.id), payload)
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`));
      }
    } catch (err) {
      console.error(`Firestore Sync error on ${collectionName}:`, err);
    }
  };

  return [data, updateData] as const;
}

export function useFirestoreDocSync<T extends { id?: string }>(
  collectionName: string,
  documentId: string | undefined,
  initialData: T,
  user: any
) {
  const [data, setData] = useState<T>(() => {
    return getCleanFallbackDoc(collectionName, initialData, user);
  });

  const initialDataRef = useRef(getCleanFallbackDoc(collectionName, initialData, user));
  useEffect(() => {
    initialDataRef.current = getCleanFallbackDoc(collectionName, initialData, user);
  }, [initialData, user]);

  useEffect(() => {
    if (!user || user.isSandbox || !documentId) {
      const saved = localStorage.getItem(`sandbox_${collectionName}_${documentId || 'doc'}`);
      if (saved) {
        try {
          setData(JSON.parse(saved));
          return;
        } catch (e) {}
      }
      setData(initialDataRef.current);
      return;
    }

    if (!documentId) return;

    const docRef = doc(db, collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.data() as T);
      } else {
        // Profile does not exist, seed
        const payload = { ...initialDataRef.current, id: documentId, userId: user.uid };
        setDoc(docRef, payload)
          .catch(err => console.warn(`Doc Seeding ${collectionName} failed (sandbox mode active):`, err.message));
        setData(initialDataRef.current);
      }
    }, (error) => {
       console.warn(`Firestore sync error on ${collectionName}/${documentId}: ${error.message}. Returning local initial data.`);
       setData(initialDataRef.current);
    });

    return () => unsubscribe();
  }, [collectionName, documentId, user?.uid, user?.isSandbox]);

  const updateDocData = async (value: React.SetStateAction<T>) => {
    if (!user || user.isSandbox || !documentId) {
      const resolved = typeof value === 'function' ? (value as any)(data) : value;
      setData(resolved);
      if (user && user.isSandbox && documentId) {
        localStorage.setItem(`sandbox_${collectionName}_${documentId}`, JSON.stringify(resolved));
      }
      return;
    }

    const resolved = typeof value === 'function' ? (value as any)(data) : value;
    setData(resolved);

    if (documentId) {
      const docRef = doc(db, collectionName, documentId);
      const payload = { ...resolved, id: documentId, userId: user.uid };
      await setDoc(docRef, payload)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${documentId}`));
    }
  };

  return [data, updateDocData] as const;
}
