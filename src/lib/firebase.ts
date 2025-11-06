import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { Auth, getAuth, connectAuthEmulator } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { FirebaseStorage, getStorage, connectStorageEmulator } from 'firebase/storage';
import { env } from '@/config/env';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId
};

class FirebaseClient {
  private static instance: FirebaseClient;
  private app: FirebaseApp;
  private _auth: Auth;
  private _firestore: Firestore;
  private _storage: FirebaseStorage;

  private constructor() {
    // Initialize Firebase
    this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize Auth
    this._auth = getAuth(this.app);
    
    // Initialize Firestore
    this._firestore = getFirestore(this.app);
    
    // Initialize Storage
    this._storage = getStorage(this.app);

    // Set up emulators for local development
    if (process.env.NODE_ENV === 'development') {
      this.setupEmulators();
    }
  }

  private setupEmulators(): void {
    // Auth emulator
    connectAuthEmulator(this._auth, 'http://localhost:9099', { disableWarnings: true });
    
    // Firestore emulator
    connectFirestoreEmulator(this._firestore, 'localhost', 8080);
    
    // Storage emulator
    connectStorageEmulator(this._storage, 'localhost', 9199);
  }

  public static getInstance(): FirebaseClient {
    if (!FirebaseClient.instance) {
      FirebaseClient.instance = new FirebaseClient();
    }
    return FirebaseClient.instance;
  }

  get auth(): Auth {
    return this._auth;
  }

  get firestore(): Firestore {
    return this._firestore;
  }

  get storage(): FirebaseStorage {
    return this._storage;
  }
}

// Export singleton instance getters
export const auth = FirebaseClient.getInstance().auth;
export const db = FirebaseClient.getInstance().firestore;
export const storage = FirebaseClient.getInstance().storage;

// Export the FirebaseClient class for direct access if needed
export default FirebaseClient;