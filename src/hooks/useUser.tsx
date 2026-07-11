import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export interface UserData {
  exp: number;
  quizAnswered: boolean | null;
  pledges: boolean[];
  name: string;
}

const defaultUserData: UserData = {
  exp: 20,
  quizAnswered: null,
  pledges: [false, false, false, false],
  name: ''
};

interface UserContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  updateUserData: async () => {}
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setUserData(null);
        setLoading(false);
        return;
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    
    // Initialize if not exists
    getDoc(userDocRef).then((docSnap) => {
      if (!docSnap.exists()) {
        setDoc(userDocRef, defaultUserData, { merge: true });
      }
    });

    const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [user]);

  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, data);
  };

  return (
    <UserContext.Provider value={{ user, userData, loading, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
}
