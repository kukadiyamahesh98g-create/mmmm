import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, CoinTransaction } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, mobile: string, city: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  saveUserProfileDetails: (name: string, mobile: string) => Promise<{ awardedCoins: boolean }>;
  addCoins: (amount: number, type: CoinTransaction['type'], description: string) => Promise<boolean>;
  deductCoins: (amount: number, type: CoinTransaction['type'], description: string) => Promise<boolean>;
  maskMobile: (mobile: string) => string;
  maskName: (name: string) => string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function maskName(name: string): string {
  if (!name) return 'Rah...';
  const clean = name.trim();
  if (clean.length <= 3) return `${clean}...`;
  return `${clean.substring(0, 3)}...`;
}

export function maskMobile(mobile: string): string {
  if (!mobile) return '98XXXXXX45';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length >= 10) {
    return `${clean.substring(0, 2)}XXXXXX${clean.substring(clean.length - 2)}`;
  }
  if (clean.length >= 4) {
    return `${clean.substring(0, 2)}XXXX${clean.substring(clean.length - 2)}`;
  }
  return '98XXXXXX45';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
          // Check if admin email
          const isAdminUser = user.email === 'kukadiyamahesh07@gmail.com' || user.email === 'admin@1xluck.com';
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            mobileNumber: '',
            city: 'Ahmedabad',
            coinBalance: 0, // 0 Coins initially; 20 coins awarded when profile is completed
            totalTicketsBought: 0,
            isBanned: false,
            role: isAdminUser ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
            isProfileCompleted: false
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } else {
          // Realtime listener
          const unsubProfile = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          });
          setLoading(false);
          return () => unsubProfile();
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string, name: string, mobile: string, city: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const user = res.user;
    const isAdminUser = email === 'kukadiyamahesh07@gmail.com' || email === 'admin@1xluck.com';
    const isCompleted = Boolean(name.trim() && mobile.trim());
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: name || user.displayName || 'User',
      mobileNumber: mobile || '',
      city: city || 'Ahmedabad',
      coinBalance: isCompleted ? 20 : 0,
      totalTicketsBought: 0,
      isBanned: false,
      role: isAdminUser ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      isProfileCompleted: isCompleted
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);

    if (isCompleted) {
      await setDoc(doc(db, 'coinTransactions', `welcome_bonus_${user.uid}`), {
        userUid: user.uid,
        amount: 20,
        type: 'welcome_bonus',
        description: 'Profile Completion Bonus (+20 Coins)',
        createdAt: new Date().toISOString()
      });
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);
  };

  const saveUserProfileDetails = async (name: string, mobile: string): Promise<{ awardedCoins: boolean }> => {
    if (!currentUser) return { awardedCoins: false };

    const userRef = doc(db, 'users', currentUser.uid);
    const bonusTxRef = doc(db, 'coinTransactions', `welcome_bonus_${currentUser.uid}`);

    try {
      const result = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User profile document does not exist.');
        }

        const userData = userDoc.data() as UserProfile;

        // Backend validation 1: Check if profile is already completed
        if (userData.isProfileCompleted) {
          transaction.update(userRef, {
            displayName: name,
            mobileNumber: mobile
          });
          return { awardedCoins: false };
        }

        // Backend validation 2: Check if welcome_bonus transaction already exists
        const bonusTxDoc = await transaction.get(bonusTxRef);
        if (bonusTxDoc.exists()) {
          transaction.update(userRef, {
            displayName: name,
            mobileNumber: mobile,
            isProfileCompleted: true
          });
          return { awardedCoins: false };
        }

        // First profile completion: Award 20 coins once and mark completed
        const currentCoins = typeof userData.coinBalance === 'number' ? userData.coinBalance : 0;
        transaction.update(userRef, {
          displayName: name,
          mobileNumber: mobile,
          isProfileCompleted: true,
          coinBalance: currentCoins + 20
        });

        // Set deterministic transaction document for idempotency
        transaction.set(bonusTxRef, {
          userUid: currentUser.uid,
          amount: 20,
          type: 'welcome_bonus',
          description: 'Profile Completion Bonus (+20 Coins)',
          createdAt: new Date().toISOString()
        });

        return { awardedCoins: true };
      });

      return result;
    } catch (err: any) {
      console.error('Error saving user profile details:', err);
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      return { awardedCoins: false };
    }
  };

  const addCoins = async (amount: number, type: CoinTransaction['type'], description: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('Cannot add coins: No internet connection');
      return false;
    }
    if (!currentUser || !userProfile) return false;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        coinBalance: increment(amount)
      });

      await addDoc(collection(db, 'coinTransactions'), {
        userUid: currentUser.uid,
        amount,
        type,
        description,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('Error adding coins:', err);
      return false;
    }
  };

  const deductCoins = async (amount: number, type: CoinTransaction['type'], description: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('Cannot deduct coins: No internet connection');
      return false;
    }
    if (!currentUser || !userProfile) return false;
    if (userProfile.coinBalance < amount) return false;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        coinBalance: increment(-amount)
      });

      await addDoc(collection(db, 'coinTransactions'), {
        userUid: currentUser.uid,
        amount: -amount,
        type,
        description,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('Error deducting coins:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateProfileData,
        saveUserProfileDetails,
        addCoins,
        deductCoins,
        maskMobile,
        maskName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
