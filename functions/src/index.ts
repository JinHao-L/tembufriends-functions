import * as admin from 'firebase-admin';

admin.initializeApp();
admin.firestore().settings({
    ignoreUndefinedProperties: true
})

export * from './auth';
export * from './firestore';