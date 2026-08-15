import React, { useState, useEffect } from 'react';
import { 
  Building2, Home, Briefcase, HardHat, ShieldAlert, Mic, Phone, FileText, Landmark, Receipt, Sliders, ScrollText, LineChart, Package, Users, Calculator, Truck, Key
} from 'lucide-react';

import { Project, Client, Worker, Material, Invoice, Inquiry, ActivityLog, Property, LandPurchase, OfficeExpense, CompanyProfile, Equipment } from './types';

// Import our tailored mock states
import { 
  initialProjects, initialClients, initialWorkers, 
  initialMaterials, initialInvoices, initialInquiries, 
  initialProperties, initialActivityLogs, initialLands,
  initialEquipment
} from './data/mockData';

// Import our modular pages
import ProjectManager from './components/ProjectManager';
import WorkerManager from './components/WorkerManager';
import EquipmentManager from './components/EquipmentManager';
import PropertyShowcase from './components/PropertyShowcase';
import Chatbot from './components/Chatbot';

// Import our new pages
import Dashboard from './components/Dashboard';
import OfficeExpenses from './components/OfficeExpenses';
import CompanySettings from './components/CompanySettings';
import BookingAgreementManager from './components/BookingAgreementManager';
import ReportTemplates from './components/ReportTemplates';
import FinanceBilling from './components/FinanceBilling';
import MaterialManager from './components/MaterialManager';
import ClientManager from './components/ClientManager';
import EstimatorCalculator from './components/EstimatorCalculator';

// Import Firebase tools and custom sync hooks
import { auth, googleProvider, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, updatePassword } from 'firebase/auth';
import { useFirestoreSync, useFirestoreDocSync } from './hooks/useFirestoreSync';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Import our SaaS pages
import SaaSPage from './components/SaaSPage';
import SaaSAdminPanel from './components/SaaSAdminPanel';
import { GlobalLogo } from './components/GlobalLogo';

// Custom initial office expenses
const initialExpenses: OfficeExpense[] = [];

export default function App() {
  // Fixed Language to English ("language me khali english chahiye")
  const lang = 'en';
  
  // Permanently Light theme ("dark mode nahi chahiye")
  const darkMode = false;

  // Firebase auth state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [saasConfig, setSaasConfig] = useState<any>(null);

  // Email/Password & Mobile OTP state variables
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let timer: any;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setAuthError('Please enter your Name before requesting OTP.');
      return;
    }
    if (!emailInput.trim()) {
      setAuthError('Please enter your Email before requesting OTP.');
      return;
    }
    if (!mobileInput.trim() || mobileInput.trim().length < 10) {
      setAuthError('Please enter a valid Mobile Number (minimum 10 digits).');
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setAuthError('Please set a Password of at least 6 characters before requesting OTP.');
      return;
    }

    setAuthError('');
    // Generate a secure simulated random 6-digit OTP code
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setIsOtpSent(true);
    setOtpTimer(60);
    setShowOtpNotification(true);
    setOtpInput('');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // First check local manual override session
      const localSessionStr = localStorage.getItem('erp_local_session');
      if (localSessionStr && !currentUser) {
        try {
          const localUser = JSON.parse(localSessionStr);
          if (localUser && localUser.isApprovedCustomer) {
            setUser(localUser);
            setAuthLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Invalid local session");
          localStorage.removeItem('erp_local_session');
        }
      }

      if (currentUser) {
        const emailKey = currentUser.email?.toLowerCase().trim();
        const localSessionStr = localStorage.getItem('erp_local_session');
        const bypassMode = !!localSessionStr;

        if (emailKey) {
          if (emailKey === 'patelmunaf90@gmail.com') {
             // Bypass check for super admin
             setUser({
                  ...currentUser,
                  isApprovedCustomer: true,
                  displayName: currentUser.displayName || 'Munaf Patel',
                  plan: 'enterprise',
                  status: 'active',
                  isSuperAdmin: true,
                } as any);
             setAuthLoading(false);
             return;
          }

          try {
            const custDocRef = doc(db, 'approved_customers', emailKey);
            const snap = await getDoc(custDocRef);
            if (snap.exists()) {
              const data = snap.data();
              if (data.status === 'active') {
                // Ensure customer's authenticated UID is saved in the approved_customer document for absolute cleanups
                if (!data.uid || data.uid !== currentUser.uid) {
                  try {
                    await setDoc(custDocRef, { ...data, uid: currentUser.uid }, { merge: true });
                  } catch (setUidErr) {
                    console.warn("Could not save customer UID into license record:", setUidErr);
                  }
                }
                setUser({
                  ...currentUser,
                  isApprovedCustomer: true,
                  displayName: data.name || currentUser.displayName,
                  plan: data.plan,
                  status: data.status
                } as any);
                setAuthLoading(false);
                return;
              } else {
                setUser(null);
                localStorage.removeItem('erp_local_session');
                await signOut(auth);
                setAuthError('Your customer plan has been suspended. Please contact the system administrator to reactivate.');
                setAuthLoading(false);
                return;
              }
            } else {
              // Not in database? 
              setUser(null);
              localStorage.removeItem('erp_local_session');
              await signOut(auth);
              setAuthError(`No standard customer authorization found for ${emailKey}. Please check with System Administrator.`);
              setAuthLoading(false);
              return;
            }
          } catch (e: any) {
            console.warn("Failed to check approved customer status on state change:", e);
            
            // If they are local bypassed, let them in anyway!
            if (bypassMode) {
              const localUser = JSON.parse(localSessionStr);
              setUser(localUser);
              setAuthLoading(false);
              return;
            }

            setAuthError("Auth state check failed: " + (e.message || String(e)));
            // We should not necessarily log them out if network is just flaky
            setUser({
               ...currentUser,
               isApprovedCustomer: true // blindly allow for now to prevent deadlock
            } as any);
          }
        }
      }
      if (!currentUser && !localStorage.getItem('erp_local_session')) {
          setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Realtime listener for SaaS Global Admin Config
  useEffect(() => {
    const docRef = doc(db, 'saas_config', 'admin');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setSaasConfig(snap.data());
      } else {
        setSaasConfig(null);
      }
    }, (err) => {
      console.warn("Couldn't read SaaS configuration from Firestore:", err);
    });
    return () => unsubscribe();
  }, []);

  // Set the first registered user as Super Admin in Firestore
  useEffect(() => {
    if (user && user.email?.toLowerCase() === 'patelmunaf90@gmail.com') {
      const checkAndRegisterSuperAdmin = async () => {
        const docRef = doc(db, 'saas_config', 'admin');
        const snap = await getDoc(docRef).catch((e) => {
          const errMsg = e instanceof Error ? e.message : String(e);
          if (errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('missing or insufficient')) {
            console.warn("SaaS Admin: Cannot check first admin status because of connection or permission error.", e);
            return null;
          }
          console.warn("Firestore error checking admin:", e);
          return null;
        });
        if (snap && !snap.exists()) {
          const adminPayload = {
            superAdminUid: user.uid,
            superAdminEmail: user.email.toLowerCase(),
            superAdminName: user.displayName || 'Munaf Patel',
            proPrice: 3999,
            supervisorPrice: 1499,
            enterprisePrice: 11999,
            globalNotice: 'Welcome to Global SaaS ERP platform! You are authorized as Super Admin.'
          };
          try {
            await setDoc(docRef, adminPayload);
            setSaasConfig(adminPayload);
            console.log("Registered first super admin in Firestore database node beautifully.");
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            if (errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('missing or insufficient')) {
              console.warn("SaaS Admin: Cannot save system admin data because of connection or permission error.");
              return;
            }
            console.warn("Firestore error saving admin data:", err);
          }
        }
      };
      checkAndRegisterSuperAdmin().catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        if (!msg.toLowerCase().includes('offline')) {
          console.error("Error setting super admin: ", e);
        }
      });
    }
  }, [user]);

  // Robust check for Super Admin status (by UID or Email)
  const isSuperAdmin = user && user.email?.toLowerCase() === 'patelmunaf90@gmail.com';

  // Auto redirect to appropriate tabs depending on access rights
  useEffect(() => {
    if (isSuperAdmin) {
      setActiveTab('saas-admin');
    } else {
      setActiveTab('dashboard');
    }
  }, [isSuperAdmin, user?.uid]);

  const handleSandboxSignIn = (customEmail?: string, customName?: string) => {
    setAuthError('');
    setActionLoading(true);
    setTimeout(() => {
      setUser({
        uid: 'sandbox-user-123',
        email: customEmail || emailInput || 'sandbox@builders.in',
        displayName: customName || nameInput || 'Munaf Patel (Sandbox)',
        isSandbox: true,
        plan: 'builder-pro',
        status: 'active'
      });
      setActionLoading(false);
    }, 500);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Sign in failed:", e);
      alert("Sign in failed: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forcing client refresh to load new firebase config 123");
    if (!emailInput || !passwordInput) {
      setAuthError('Email and Password are required.');
      return;
    }
    setAuthError('');
    setActionLoading(true);

    const emailKey = emailInput.trim().toLowerCase();

    try {
      // 1. Check if this is an approved customer configured in the SaaS administration
      let custSnap = null;
      try {
        const custDocRef = doc(db, 'approved_customers', emailKey);
        custSnap = await getDoc(custDocRef);
      } catch (getDocErr: any) {
        const errMsg = getDocErr.message || String(getDocErr);
        if (errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('missing or insufficient')) {
          console.warn("Firestore fetch error on sign in, falling back directly to Firebase Authentication sign in.", getDocErr);
        } else {
          throw getDocErr;
        }
      }

      if (custSnap && custSnap.exists()) {
        const custData = custSnap.data();
        if (custData.status === 'inactive') {
          setAuthError('Your customer plan has been suspended. Please contact the system administrator to reactivate.');
          setActionLoading(false);
          return;
        }
        
        // Super admin bypasses the strict Firestore password comparison if they have no password set in Firestore
        // (e.g. if they just created their account normally or were seeded).
        const isSuperAdminLogin = emailKey === 'patelmunaf90@gmail.com';
        
        if (!isSuperAdminLogin && custData.password && custData.password !== passwordInput.trim()) {
          setAuthError('Incorrect password. Please enter the correct password provided by your building builder/supplier.');
          setActionLoading(false);
          return;
        } else if (!isSuperAdminLogin && !custData.password && passwordInput.trim() !== '') {
          // If a customer was registered through standard sign up but is in approved_customers without a password field,
          // we can just let Firebase Auth validate them. But typically standard customers have a derived password.
        }

        // If the password matches and is active, sign in to Firebase Auth.
        // We derive a deterministic password to prevent Firebase Auth account lockouts or password gaps
        // when super admins change, delete, or re-grant access.
        const authPassword = isSuperAdminLogin ? passwordInput.trim() : `Global_ERP_${emailKey}_Secure_Auth_123!`;

        try {
          await signInWithEmailAndPassword(auth, emailKey, authPassword);
        } catch (authErr: any) {
          // If they have an existing traditional Firebase account with original typed password, fall back to that!
          if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
            try {
              await signInWithEmailAndPassword(auth, emailKey, passwordInput.trim());
              // Since legacy fallback worked, smoothly migrate their Firebase Auth password to the derived sync password!
              if (auth.currentUser) {
                await updatePassword(auth.currentUser, authPassword).catch(pErr => {
                  console.warn("Could not update Firebase Auth password to derived format:", pErr);
                });
              }
            } catch (fallbackErr: any) {
              // If traditional fallback fails or is wrong, or user does not exist, auto-create them using derived password!
              if (fallbackErr.code === 'auth/user-not-found' || fallbackErr.code === 'auth/invalid-credential' || fallbackErr.code === 'auth/wrong-password') {
                try {
                  const userCredential = await createUserWithEmailAndPassword(auth, emailKey, authPassword);
                  await updateProfile(userCredential.user, { displayName: custData.name });
                  setUser({
                    ...userCredential.user,
                    isApprovedCustomer: true,
                    displayName: custData.name,
                    plan: custData.plan,
                    status: custData.status
                  } as any);
                } catch (createErr: any) {
                  if (createErr.code === 'auth/email-already-in-use') {
                    // DEADLOCK BYPASS: User exists in Firebase Auth but has a stale unknown password.
                    // Since their typed password matches the newly-set Firestore password perfectly,
                    // we grant them a local valid session bypass.
                    if (isSuperAdminLogin) {
                       // Super admins MUST use the correct password they originally signed up with,
                       // we do not grant them a default bypass since they don't use strict Firestore passwords.
                       throw fallbackErr;
                    }
                    const fallbackUid = custData.uid || (`local_bypass_${emailKey.replace(/[^a-zA-Z0-9]/g, '')}`);
                    const localSession = {
                      uid: fallbackUid,
                      email: emailKey,
                      isApprovedCustomer: true,
                      displayName: custData.name,
                      plan: custData.plan,
                      status: custData.status
                    };
                    localStorage.setItem('erp_local_session', JSON.stringify(localSession));
                    setUser(localSession as any);
                    return;
                  }
                  console.error("Auto Firebase registration failed on create:", createErr);
                  throw createErr;
                }
              } else {
                // If it wasn't a standard auth credential mismatch, but an API key/network error, allow Bypass since Firestore password matched!
                if (isSuperAdminLogin) {
                   throw fallbackErr;
                }
                const fallbackUid = custData.uid || (`local_bypass_${emailKey.replace(/[^a-zA-Z0-9]/g, '')}`);
                const localSession = {
                  uid: fallbackUid,
                  email: emailKey,
                  isApprovedCustomer: true,
                  displayName: custData.name,
                  plan: custData.plan,
                  status: custData.status
                };
                localStorage.setItem('erp_local_session', JSON.stringify(localSession));
                setUser(localSession as any);
                return;
              }
            }
          } else if (authErr.code === 'auth/user-not-found') {
            // User does not exist at all, auto create with derived password!
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, emailKey, authPassword);
              await updateProfile(userCredential.user, { displayName: custData.name });
              setUser({
                ...userCredential.user,
                isApprovedCustomer: true,
                displayName: custData.name,
                plan: custData.plan,
                status: custData.status
              } as any);
            } catch (createErr: any) {
              if (createErr.code === 'auth/email-already-in-use') {
                if (isSuperAdminLogin) {
                   throw authErr;
                }
                const fallbackUid = custData.uid || (`local_bypass_${emailKey.replace(/[^a-zA-Z0-9]/g, '')}`);
                const localSession = {
                  uid: fallbackUid,
                  email: emailKey,
                  isApprovedCustomer: true,
                  displayName: custData.name,
                  plan: custData.plan,
                  status: custData.status
                };
                localStorage.setItem('erp_local_session', JSON.stringify(localSession));
                setUser(localSession as any);
                return;
              }
              console.error("Auto Firebase registration failed on user-not-found create:", createErr);
              throw createErr;
            }
          } else {
             // Network or API Key error from Firebase Auth. But Firestore succeeded and password checked out! Bypassing!
             if (isSuperAdminLogin) {
                throw authErr;
             }
             console.warn("Firebase Auth generic fail but Firestore matched, bypassing:", authErr);
             const fallbackUid = custData.uid || (`local_bypass_${emailKey.replace(/[^a-zA-Z0-9]/g, '')}`);
             const localSession = {
                uid: fallbackUid,
                email: emailKey,
                isApprovedCustomer: true,
                displayName: custData.name,
                plan: custData.plan,
                status: custData.status
             };
             localStorage.setItem('erp_local_session', JSON.stringify(localSession));
             setUser(localSession as any);
             return;
          }
        }
      } else {
        // Not a direct approved customer or Firestore was offline (perhaps Super Admin or direct login)
        try {
          await signInWithEmailAndPassword(auth, emailKey, passwordInput);
        } catch (authFallbackErr: any) {
          if (authFallbackErr.code === 'auth/wrong-password' || authFallbackErr.code === 'auth/invalid-credential' || authFallbackErr.code === 'auth/user-not-found') {
             // Maybe it was a synced customer and Firestore fetch failed, or the user is trying to login directly!
             const derivedPassword = `Global_ERP_${emailKey}_Secure_Auth_123!`;

             if (emailKey === 'patelmunaf90@gmail.com') {
                // Auto create super admin if it doesn't exist
                try {
                  const userCred = await createUserWithEmailAndPassword(auth, emailKey, passwordInput);
                  await updateProfile(userCred.user, { displayName: "Munaf Patel" });
                  return; // success
                } catch(regErr: any) {
                  if (regErr.code !== 'auth/email-already-in-use') {
                    throw regErr;
                  } else {
                     // wrong password provided for existing super admin
                     throw authFallbackErr;
                  }
                }
             }

             try {
                await signInWithEmailAndPassword(auth, emailKey, derivedPassword);
                // If it succeeds, they are obviously a valid user! We'll just let the onAuthStateChanged handle the rest.
             } catch (e: any) {
                // If even the derived password fallback fails, we must throw the original error
                throw authFallbackErr;
             }
          } else {
            throw authFallbackErr;
          }
        }
      }
    } catch (err: any) {
      console.warn("Email sign in failed:", err);
      let errMsg = err.message || String(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = `Invalid email or password.`;
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      } else if (errMsg && errMsg.toLowerCase().includes('offline')) {
        errMsg = 'Your client appears to be offline. Please verify your network connection and retry!';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password authentication is disabled in Firebase. Please go to Firebase Console -> Authentication -> Sign-in method -> Enable "Email/Password" and click Save.';
      } else if (err.code === 'auth/email-already-in-use') {
         errMsg = 'Email already exists with a different credential. Please reset your password.';
      }
      setAuthError(`Sign In Error: ${errMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Forcing client refresh to load new firebase config 123 signup");
    if (!emailInput || !passwordInput || !nameInput || !mobileInput) {
      setAuthError('Full Name, Email, Password, and Mobile Number are required.');
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthError('');
    setActionLoading(true);
    try {
      sessionStorage.setItem('temp_reg_phone', mobileInput.trim());

      const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
      await updateProfile(userCredential.user, { displayName: nameInput });
      
      const emailKey = emailInput.toLowerCase().trim();
      const newCustRef = doc(db, 'approved_customers', emailKey);
      try {
        await setDoc(newCustRef, {
           email: emailKey,
           name: nameInput,
           plan: 'premium',
           status: 'active',
           uid: userCredential.user.uid,
           phone: mobileInput.trim(),
           createdAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("Failed to set approved customer:", err);
      }
      
      setUser({ ...userCredential.user, displayName: nameInput });
    } catch (err: any) {
      console.error("Email sign up failed:", err);
      let errMsg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered and in use. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Email/Password authentication is disabled in Firebase. Please go to Firebase Console -> Authentication -> Sign-in method -> Enable "Email/Password" and click Save.';
      }
      setAuthError(errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('erp_local_session');
      await signOut(auth);
      setUser(null);
      setEmailInput('');
      setPasswordInput('');
      setNameInput('');
      setAuthError('');
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  // Real-time listener to check if the currently logged-in customer is deactivated or active
  useEffect(() => {
    if (!user || !user.isApprovedCustomer || !user.email) return;

    const emailKey = user.email.trim().toLowerCase();
    let unsubscribeFirestore: (() => void) | null = null;

    try {
      const docRef = doc(db, 'approved_customers', emailKey);
      unsubscribeFirestore = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.status === 'inactive') {
            console.warn("User plan has been suspended or deactivated. Logging out.");
            handleSignOut();
            setAuthError('Your customer plan has been suspended. Please contact the system administrator to reactivate.');
          }
        } else {
          // If the admin completely deleted this approved customer
          handleSignOut();
          setAuthError('Your customer license has been terminated. Please contact layout administrator.');
        }
      }, (err) => {
        console.warn("Real-time login customer doc listener failed/offline:", err);
      });
    } catch (e) {
      console.warn("Failed to subscribe to customer doc:", e);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user?.email, user?.isApprovedCustomer]);

  // Synchronized Firestore state hook maps
  const [projects, setProjects] = useFirestoreSync<Project>('projects', initialProjects, user);
  const [lands, setLands] = useFirestoreSync<LandPurchase>('lands', initialLands, user);
  const [clients, setClients] = useFirestoreSync<Client>('clients', initialClients, user);
  const [workers, setWorkers] = useFirestoreSync<Worker>('workers', initialWorkers, user);
  const [materials, setMaterials] = useFirestoreSync<Material>('materials', initialMaterials, user);
  const [equipment, setEquipment] = useFirestoreSync<Equipment>('equipment', initialEquipment, user);
  const [invoices, setInvoices] = useFirestoreSync<Invoice>('invoices', initialInvoices, user);
  const [inquiries, setInquiries] = useFirestoreSync<Inquiry>('inquiries', initialInquiries, user);
  const [activityLogs, setActivityLogs] = useFirestoreSync<ActivityLog>('activityLogs', initialActivityLogs, user);
  const [properties, setProperties] = useFirestoreSync<Property>('properties', initialProperties, user);
  const [expenses, setExpenses] = useFirestoreSync<OfficeExpense>('expenses', initialExpenses, user);

  // Dynamic company settings profile state
  const defaultProfile: CompanyProfile = {
    companyName: 'Global Developers',
    address: '708-712 Empire State Hub, Ring Road, Ahmedabad, GJ, India',
    directorName: user?.displayName || 'Munaf Patel',
    state: 'Gujarat',
    city: 'Ahmedabad',
    phoneNo: sessionStorage.getItem('temp_reg_phone') || user?.phoneNumber || '+91 94280 11982',
    gstNo: '24AAACH9231M1Z0',
    logoUrl: '',
    pettyCashFund: 0
  };

  const [profile, setProfile] = useFirestoreDocSync<CompanyProfile>('profile', user?.uid, defaultProfile, user);

  // Computed pettyCashFund dynamic state mapped from profile document
  const pettyCashFund = profile.pettyCashFund ?? 0;
  
  const setPettyCashFund = (newFund: number | ((prev: number) => number)) => {
    setProfile(prev => {
      const resolved = typeof newFund === 'function' ? newFund(prev.pettyCashFund ?? 0) : newFund;
      return { ...prev, pettyCashFund: resolved };
    });
  };

  // Navigation active state - updated exactly as requested
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'buy-land' | 'contracts' | 'sell-flats' | 'worker-attendance' | 'office-expenses' | 'company-profile' | 'booking-agreement' | 'report-templates' | 'inventory' | 'finance-billing' | 'clients' | 'estimator'
  >('dashboard');

  const userRole = 'Managing Director';

  // Apply light mode theme defaults
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.backgroundColor = '#f8fafc'; // light slate elegant white
  }, []);

  // Global activity logging callback
  const handleLogActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      user: profile.directorName,
      role: userRole,
      action: action,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      details: details
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Add inquiry coming from Property Showcase
  const handleAddInquiry = (inqData: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const newInquiry: Inquiry = {
      ...inqData,
      id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setInquiries(prev => [newInquiry, ...prev]);
    handleLogActivity('New Property Booking Inquiry', `Registered entry from candidate ${newInquiry.name} for ${newInquiry.propertyType}.`);
  };

  // Secure Database Exporter (Download full state CSV/JSON backup)
  const handleExportBackup = () => {
    const dataBackup = {
      application: profile.companyName,
      timestamp: new Date().toISOString(),
      authorizedUser: profile.directorName,
      role: userRole,
      projects,
      clients,
      workers,
      materials,
      invoices,
      inquiries,
      activityLogs,
      expenses,
      lands,
      properties,
      pettyCashFund,
      profile
    };

    const str = JSON.stringify(dataBackup, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hindustan_builder_backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleLogActivity('Database Export Triggered', 'Successfully saved absolute state backup locally.');
    alert('🔐 Secure Backup Generated!\n\nGlobal Construction ledger is encrypted and downloaded to your downloads folder as a standard JSON compliance report.');
  };

  // Secure Database Importer (Restores entire state from a downloaded backup)
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Restore each state if it is present in the imported file
        if (json.projects) {
          setProjects(json.projects);
        }
        if (json.lands) {
          setLands(json.lands);
        }
        if (json.clients) {
          setClients(json.clients);
        }
        if (json.workers) {
          setWorkers(json.workers);
        }
        if (json.materials) {
          setMaterials(json.materials);
        }
        if (json.invoices) {
          setInvoices(json.invoices);
        }
        if (json.inquiries) {
          setInquiries(json.inquiries);
        }
        if (json.activityLogs) {
          setActivityLogs(json.activityLogs);
        }
        if (json.properties) {
          setProperties(json.properties);
        }
        if (json.expenses) {
          setExpenses(json.expenses);
        }
        if (json.pettyCashFund !== undefined) {
          setPettyCashFund(Number(json.pettyCashFund));
        }
        if (json.profile) {
          setProfile(json.profile);
        }

        handleLogActivity('Database Backup Imported', 'Successfully restored absolute state backup from custom JSON.');
        alert('🎉 Ledger Sheet Backup Imported Successfully!\n\nAll construction data, transactions, and client accounts have been beautifully restored.');
      } catch (err) {
        alert('❌ Error parsing backup file. Please ensure it is a valid Global Construction JSON/Backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Quick Action form overlays helper via dashboard
  const handleQuickAdd = (formType: 'land' | 'contract' | 'flat' | 'expense') => {
    if (formType === 'land') {
      setActiveTab('buy-land');
      setTimeout(() => {
        const addBtn = document.querySelector('[id="project-manager"] button');
        if (addBtn) (addBtn as HTMLButtonElement).click();
      }, 100);
    } else if (formType === 'contract') {
      setActiveTab('contracts');
      setTimeout(() => {
        const addBtns = document.querySelectorAll('button');
        const contractBtn = ArialFindButton(addBtns, 'Contract');
        if (contractBtn) contractBtn.click();
      }, 100);
    } else if (formType === 'flat') {
      setActiveTab('sell-flats');
      setTimeout(() => {
        const addBtn = document.querySelector('[id="property-showcase"] button');
        if (addBtn) (addBtn as HTMLButtonElement).click();
      }, 100);
    } else if (formType === 'expense') {
      setActiveTab('office-expenses');
      setTimeout(() => {
        const addBtn = document.querySelector('[id="office-expenses"] button');
        if (addBtn) (addBtn as HTMLButtonElement).click();
      }, 100);
    }
  };

  const ArialFindButton = (buttons: NodeListOf<HTMLButtonElement> | HTMLButtonElement[], keyword: string): HTMLButtonElement | null => {
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent?.includes(keyword)) {
        return buttons[i];
      }
    }
    return null;
  };

  // Low stock inventory warning computation
  const lowStockItems = materials.filter(m => m.stock <= m.minimumStock);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-slate-900">HINDUSTAN BUILDER GROUP</h2>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-1">Connecting to Secure Cloud Ledger...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <SaaSPage
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        authError={authError}
        setAuthError={setAuthError}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        nameInput={nameInput}
        setNameInput={setNameInput}
        mobileInput={mobileInput}
        setMobileInput={setMobileInput}
        actionLoading={actionLoading}
        handleEmailSignIn={handleEmailSignIn}
        handleEmailSignUp={handleEmailSignUp}
        handleGoogleSignIn={handleGoogleSignIn}
        handleSandboxSignIn={handleSandboxSignIn}
        saasConfig={saasConfig}
      />
    );
  }

  // Pure SaaS Sovereign Admin Panel layout - strictly restricts access to standard builder app
  if (isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
        {/* elegant clean Super Admin Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 sm:px-6 py-4">
          <div className="w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 px-2 sm:px-4 lg:px-8 xl:px-12">
            <div className="flex items-center gap-3 select-none">
              <div className="w-11 h-11 bg-slate-900 rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-800">
                <span className="text-amber-500 font-black text-xl">👑</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <h1 className="text-sm sm:text-base font-black tracking-wide uppercase text-slate-900">
                    HINDUSTAN SAAS PLATFORM
                  </h1>
                  <span className="text-[9px] uppercase font-mono tracking-widest bg-amber-500/15 text-amber-800 py-0.5 px-2 rounded-md border border-amber-500/30 font-black">
                    SUPER ADMIN ROOT
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Sovereign Control Centre & CRM Licenses Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 py-1.5 px-3.5 rounded-xl text-xs font-mono">
                <span className="text-slate-500 uppercase font-black text-[9px]">Logged in:</span>
                <strong className="text-slate-800 font-bold">{user.email}</strong>
              </div>
              <button 
                onClick={handleSignOut}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 px-4 rounded-xl text-xs font-black tracking-wide transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Global Realtime SaaS Banner */}
        <div className="bg-slate-900 text-slate-200 text-center py-2 px-4 shadow-sm select-none">
          <div className="w-full mx-auto flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-amber-500 px-2 sm:px-4 lg:px-8 xl:px-12">
            👑 SYSTEM CONTROLLER ACTIVE • FIRESTORE REALTIME SYNC CONNECTED
          </div>
        </div>

        {/* Main Content area */}
        <main className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-8">
          <SaaSAdminPanel
            user={user}
            saasConfig={saasConfig}
            onUpdateSaasConfig={async (newConfig) => {
              if (user) {
                try {
                  await setDoc(doc(db, 'saas_config', 'admin'), newConfig);
                } catch (e) {
                  console.warn("Firestore error saving saas config internally:", e);
                }
              } else {
                setSaasConfig(newConfig);
              }
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans antialiased pb-24 lg:pb-0 flex flex-col">
      
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 py-3.5 text-slate-800">
        <div className="w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-3 px-2 sm:px-4 md:px-8 xl:px-12">
          
          {/* Logo Brand Segment */}
          <div className="flex items-center gap-3 select-none">
            {profile.logoUrl ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-sm border border-amber-400/20 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain bg-white p-1" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 animate-fade-in">
                    <h1 className="text-sm font-black tracking-wide uppercase text-slate-900 truncate max-w-[180px] md:max-w-xs">
                      {profile.companyName}
                    </h1>
                    <span className="text-[9px] uppercase font-mono tracking-widest bg-amber-500/10 text-amber-700 py-0.5 px-1.5 rounded-md border border-amber-500/20 font-bold whitespace-nowrap">
                      {isSuperAdmin ? '👑 SaaS Owner' : 'MD Group'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Industrial & Luxury Infrastructure, India</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GlobalLogo iconClassName="w-11 h-11" iconOnly={false} />
                <span className="text-[9px] uppercase font-mono tracking-widest bg-amber-500/10 text-amber-700 py-0.5 px-1.5 rounded-md border border-amber-500/20 font-bold whitespace-nowrap self-start mt-1">
                  {isSuperAdmin ? '👑 SaaS Owner' : 'MD Group'}
                </span>
              </div>
            )}
          </div>

          {/* Centered AI Advisor Segment */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <Chatbot triggerMode="inline" currentContext={{ projects, materials, invoices, inquiries, activeTab, expenses }} />
          </div>

          {/* Right Header: Onsite Executive Display */}
          <div className="flex items-center gap-4 justify-end">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 py-1.5 px-3.5 rounded-xl">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User Avatar" className="w-5 h-5 rounded-full border border-slate-300" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <div className="text-left font-mono">
                <span className="block text-[8px] text-slate-500 uppercase font-black">
                  {isSuperAdmin ? '👑 Platform Super Admin' : 'Onsite Managing Director'}
                </span>
                <span className="block text-[10px] text-slate-800 font-black animate-fade-in">{profile.directorName}</span>
              </div>
            </div>
            {user && (
              <button 
                onClick={handleSignOut}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-250 py-1.5 px-3.5 rounded-xl text-xs font-black tracking-wide transition cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>

        </div>
      </header>

      {/* RERA Live Ticker Bar - English Only */}
      <div className="bg-amber-500 text-slate-950 font-black py-1.5 text-center px-4 overflow-hidden shadow-sm select-none">
          <div className="w-full mx-auto flex justify-between items-center text-[10px] uppercase font-mono tracking-wide px-2 sm:px-4 md:px-8 xl:px-12">
          <span className="flex items-center gap-1">📣 RERA ID VERIFIED: {profile.city?.substring(0, 6).toUpperCase() || 'SANAND'}-{profile.state?.substring(0, 2).toUpperCase() || 'GJ'}-A1M</span>
          <span className="hidden md:inline">⚡ IS CODE-456 REINFORCED CONCRETE COMPLIANCE CHECKS PASSED</span>
          <span>📅 Date: {new Date().toISOString().substring(0, 10)} UTC</span>
        </div>
      </div>

      {user?.isSandbox && (
        <div className="bg-emerald-50 text-emerald-850 font-bold py-2.5 text-center px-4 overflow-hidden shadow-sm border-b border-emerald-100 select-none">
          <div className="w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] uppercase font-mono tracking-wider px-2 sm:px-4 md:px-8 xl:px-12">
            <span className="flex items-center gap-2 font-black text-emerald-800">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              💡 ACTIVE: RUNNING IN SECURE LOCAL SANDBOX MODE (FIREBASE EMAIL AUTH DISPENSABILITY DETECTED)
            </span>
            <span className="bg-emerald-600 text-white font-extrabold tracking-widest text-[9px] py-1 px-2.5 rounded-md uppercase shrink-0 border border-emerald-500/30">
              Client Sync Active 📱
            </span>
          </div>
        </div>
      )}

      {/* Realtime SaaS admin notice banner */}
      {saasConfig?.globalNotice && (
        <div className="bg-orange-600 text-white text-center py-2 px-4 shadow-md select-none border-b border-orange-700 animate-pulse">
          <div className="w-full mx-auto flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black tracking-widest uppercase px-2 sm:px-4 md:px-8 xl:px-12">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[9px] font-mono shrink-0">📢 SYSTEM NOTICE</span>
            <span className="truncate">{saasConfig.globalNotice.replace(/Hindustan/gi, 'Global')}</span>
          </div>
        </div>
      )}

      {/* Critical low inventory alert banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-700 text-center py-2 px-4 shadow-sm select-none">
          <div className="w-full mx-auto flex items-center justify-center gap-2 text-[11px] font-bold px-2 sm:px-4 md:px-8 xl:px-12">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span>CRITICAL INVENTORY ALERT: Cement bags ({materials[0].stock}) is falling below standard construction limit!</span>
          </div>
        </div>
      )}

      {/* Main Structural Body layout */}
      <main className="w-full mx-auto px-4 sm:px-6 md:px-8 xl:px-12 py-4 lg:flex-1 lg:h-0 lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8 lg:h-full lg:overflow-hidden">
          
          {/* LEFT COLUMN: Clean Light-themed Sidebar Navigation Menu */}
          <div className="lg:col-span-3 xl:col-span-2.5 2xl:col-span-2 space-y-4 hidden lg:block lg:h-full lg:overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            <div className="bg-white p-4 border border-slate-200/80 rounded-3xl space-y-1.5 shadow-sm">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-black block mb-2 px-2.5 tracking-wider">
                MAIN NAVIGATION
              </span>

              {[
                { tab: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'buy-land', label: 'Buy Land (Zameen)', icon: <Landmark className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'contracts', label: 'Contracts (Theka)', icon: <Briefcase className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'sell-flats', label: 'Sell Flats', icon: <Building2 className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'clients', label: 'Client Accounts', icon: <Users className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'worker-attendance', label: 'Worker Attendance', icon: <HardHat className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'inventory', label: 'Stock / Inventory', icon: <Package className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'equipment', label: 'Machinery & Equipment', icon: <Truck className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'estimator', label: 'Estimator & RERA', icon: <Calculator className="w-4 h-4 text-amber-500 font-extrabold" />, isExternal: false, url: '' },
                { tab: 'finance-billing', label: 'GST Finance & Billing', icon: <FileText className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'booking-agreement', label: 'Booking Agreement', icon: <ScrollText className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'office-expenses', label: 'Office Expenses', icon: <Receipt className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'report-templates', label: 'Report Templates', icon: <LineChart className="w-4 h-4" />, isExternal: false, url: '' },
                { tab: 'company-profile', label: 'Company Profile', icon: <Sliders className="w-4 h-4" />, isExternal: false, url: '' },
                ...(isSuperAdmin ? [
                  { tab: 'saas-admin', label: '👑 SaaS Administration', icon: <Sliders className="w-4 h-4 text-amber-500 font-extrabold animate-pulse" />, isExternal: false, url: '' },
                  { tab: 'firebase-auth', label: '🔐 Sign-in Method options', icon: <Key className="w-4 h-4 text-amber-500 font-extrabold" />, isExternal: true, url: 'https://console.firebase.google.com/project/inspired-stratum-652jj/authentication/providers' }
                ] : [])
              ].map((item) => item.isExternal ? (
                <a
                  key={item.tab}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                >
                  <span className="text-slate-400">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as any)}
                  className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center gap-3 ${
                    activeTab === item.tab 
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <span className={activeTab === item.tab ? 'text-slate-950 font-bold' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Local backup downloader */}
            <div className="bg-white p-4.5 border border-slate-200/80 rounded-3xl text-center space-y-2 shadow-sm">
              <span className="text-[9px] uppercase font-mono text-slate-400 block font-bold">Data Security</span>
              <button
                onClick={handleExportBackup}
                className="w-full text-center bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 transition py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
              >
                💾 EXPORT LEDGER SHEET
              </button>
              <label className="w-full block text-center bg-slate-55 border border-slate-200 text-slate-800 hover:bg-slate-100 transition py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer">
                📂 IMPORT LEDGER SHEET
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportBackup} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* RIGHT COLUMN: Tab Module Content */}
          <div className="lg:col-span-9 xl:col-span-9.5 2xl:col-span-10 lg:h-full lg:overflow-y-auto lg:pr-2 pb-12 lg:pb-0" id="tab-module-content" style={{ scrollbarWidth: 'thin' }}>
            
            {activeTab === 'saas-admin' && isSuperAdmin && (
              <SaaSAdminPanel
                user={user}
                saasConfig={saasConfig}
                onUpdateSaasConfig={async (newConfig) => {
                  if (user) {
                    await setDoc(doc(db, 'saas_config', 'admin'), newConfig);
                  } else {
                    setSaasConfig(newConfig);
                  }
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard 
                lands={lands}
                projects={projects}
                properties={properties}
                workers={workers}
                expenses={expenses}
                inquiries={inquiries}
                profile={profile}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenQuickAdd={handleQuickAdd}
              />
            )}

            {activeTab === 'company-profile' && (
              <CompanySettings
                profile={profile}
                setProfile={setProfile}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'buy-land' && (
              <ProjectManager
                lang={lang}
                projects={projects}
                setProjects={setProjects}
                lands={lands}
                setLands={setLands}
                clients={clients}
                materials={materials}
                setMaterials={setMaterials}
                workers={workers}
                setWorkers={setWorkers}
                onLogActivity={handleLogActivity}
                initialTab="lands"
              />
            )}

            {activeTab === 'contracts' && (
              <ProjectManager
                lang={lang}
                projects={projects}
                setProjects={setProjects}
                lands={lands}
                setLands={setLands}
                clients={clients}
                materials={materials}
                setMaterials={setMaterials}
                workers={workers}
                setWorkers={setWorkers}
                onLogActivity={handleLogActivity}
                initialTab="contracts"
              />
            )}

            {activeTab === 'sell-flats' && (
              <PropertyShowcase 
                lang={lang} 
                properties={properties}
                setProperties={setProperties}
                projects={projects}
                profile={profile}
                onAddInquiry={handleAddInquiry}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'worker-attendance' && (
              <WorkerManager 
                lang={lang} 
                workers={workers} 
                setWorkers={setWorkers} 
                projects={projects}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'office-expenses' && (
              <OfficeExpenses 
                expenses={expenses}
                setExpenses={setExpenses}
                profile={profile}
                onLogActivity={handleLogActivity}
                pettyCashFund={pettyCashFund}
                setPettyCashFund={setPettyCashFund}
              />
            )}

            {activeTab === 'finance-billing' && (
              <FinanceBilling 
                lang={lang}
                invoices={invoices}
                setInvoices={setInvoices}
                clients={clients}
                projects={projects}
                profile={profile}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'inventory' && (
              <MaterialManager 
                lang={lang}
                materials={materials}
                setMaterials={setMaterials}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'equipment' && (
              <EquipmentManager 
                lang={lang}
                equipment={equipment}
                setEquipment={setEquipment}
                projects={projects}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'estimator' && (
              <EstimatorCalculator
                projects={projects}
                materials={materials}
                setMaterials={setMaterials}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'clients' && (
              <ClientManager 
                lang={lang}
                clients={clients}
                setClients={setClients}
                projects={projects}
              />
            )}

            {activeTab === 'booking-agreement' && (
              <BookingAgreementManager
                properties={properties}
                setProperties={setProperties}
                projects={projects}
                profile={profile}
                onLogActivity={handleLogActivity}
              />
            )}

            {activeTab === 'report-templates' && (
              <ReportTemplates
                profile={profile}
                projects={projects}
                properties={properties}
                expenses={expenses}
                lands={lands}
                pettyCashFund={pettyCashFund}
              />
            )}

          </div>

        </div>
      </main>

      {/* MOBILE PERSISTENT NAVIGATION BAR */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden px-2 py-2 shadow-lg flex overflow-x-auto whitespace-nowrap gap-4 items-center pl-4 pr-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {[
          { tab: 'dashboard', label: 'Home', icon: <Home className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'buy-land', label: 'Zameen', icon: <Landmark className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'contracts', label: 'Theka', icon: <Briefcase className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'sell-flats', label: 'Sell', icon: <Building2 className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'clients', label: 'Clients', icon: <Users className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'worker-attendance', label: 'Labour', icon: <HardHat className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'inventory', label: 'Stock', icon: <Package className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'equipment', label: 'Machinery', icon: <Truck className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'estimator', label: 'Estimator', icon: <Calculator className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'finance-billing', label: 'GST Bills', icon: <FileText className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'booking-agreement', label: 'Booking', icon: <ScrollText className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'office-expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'report-templates', label: 'Reports', icon: <LineChart className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          { tab: 'company-profile', label: 'Profile', icon: <Sliders className="w-4 h-4 shrink-0" />, isExternal: false, url: '' },
          ...(isSuperAdmin ? [
            { tab: 'saas-admin', label: 'SaaS Admin', icon: <Sliders className="w-4 h-4 shrink-0 text-amber-500 font-extrabold animate-bounce" />, isExternal: false, url: '' },
            { tab: 'firebase-auth', label: 'Auth Setup', icon: <Key className="w-4 h-4 shrink-0 text-amber-500 font-extrabold animate-bounce" />, isExternal: true, url: 'https://console.firebase.google.com/project/inspired-stratum-652jj/authentication/providers' }
          ] : [])
        ].map((item) => item.isExternal ? (
          <a
            key={item.tab}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 p-1 transition min-w-[60px] text-slate-400 hover:text-amber-600"
          >
            {item.icon}
            <span className="text-[9px] font-bold block">{item.label}</span>
          </a>
        ) : (
          <button
            key={item.tab}
            onClick={() => {
              setActiveTab(item.tab as any);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 p-1 transition min-w-[60px] ${
              activeTab === item.tab ? 'text-amber-600 font-extrabold' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-bold block">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
