import * as admin from 'firebase-admin';

admin.initializeApp();

export * from './auth';
export * from './firestore'