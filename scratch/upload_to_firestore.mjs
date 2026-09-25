import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyAj-6BYSuRs5QpxkKB0MKrDL-3pK2xWgGY",
  authDomain: "gd-web-tracker.firebaseapp.com",
  projectId: "gd-web-tracker",
  storageBucket: "gd-web-tracker.firebasestorage.app",
  messagingSenderId: "815933422124",
  appId: "1:815933422124:web:5751198651d49ab5096f89",
  measurementId: "G-7QLTGT53KT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rawData = JSON.parse(fs.readFileSync('./scratch/preparedData.json', 'utf-8'));
const { ashritLevels, arshLevels, sharedLevels } = rawData;

async function upload() {
  console.log('Starting upload to Firestore gd-web-tracker...');
  console.log(`Ashrit: ${ashritLevels.length} levels`);
  console.log(`Arsh: ${arshLevels.length} levels`);
  console.log(`Shared: ${sharedLevels.length} levels`);

  // Upload Ashrit
  for (const level of ashritLevels) {
    const docRef = doc(db, 'ashrit_demons', level.id);
    const clean = Object.fromEntries(Object.entries(level).filter(([_, v]) => v !== undefined));
    await setDoc(docRef, clean, { merge: true });
    console.log(`Uploaded Ashrit demon: ${level.name} (${level.id})`);
  }

  // Upload Arsh
  for (const level of arshLevels) {
    const docRef = doc(db, 'arsh_demons', level.id);
    const clean = Object.fromEntries(Object.entries(level).filter(([_, v]) => v !== undefined));
    await setDoc(docRef, clean, { merge: true });
    console.log(`Uploaded Arsh demon: ${level.name} (${level.id}) with date: ${level.date}`);
  }

  // Upload Shared
  for (const level of sharedLevels) {
    const docRef = doc(db, 'wishlist_demons', level.id);
    const clean = Object.fromEntries(Object.entries(level).filter(([_, v]) => v !== undefined));
    await setDoc(docRef, clean, { merge: true });
    console.log(`Uploaded Wishlist demon: ${level.name} (${level.id})`);
  }

  console.log('ALL LEVELS UPLOADED SUCCESSFULLY!');
  process.exit(0);
}

upload().catch((err) => {
  console.error('Upload failed:', err);
  process.exit(1);
});
