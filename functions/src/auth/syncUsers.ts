// import * as functions from 'firebase-functions';
// import * as admin from 'firebase-admin';
//
// const db = admin.firestore();
// const auth = admin.auth();
//
// export const syncUsers = functions.https.onCall((request, context) => {
//     // Checking that the user is authenticated.
//     if (!context.auth) {
//         throw new functions.https.HttpsError(
//             'failed-precondition',
//             'The function must be called while authenticated.',
//         );
//     }
//
//     return auth
//         .listUsers()
//         .then(async (listUserResult) => {
//             const updatePromises: Promise<admin.auth.UserRecord>[] = [];
//             for (const userRecord of listUserResult.users) {
//                 const userRef = db.collection('users').doc(`${userRecord.uid}`);
//                 await userRef.get()
//                     .then((snapshot) => snapshot.data())
//                     .then((userData) => {
//                         if (userData) {
//                             const promise = auth.updateUser(userData.uid, {
//                                 displayName: userData.displayName,
//                                 photoURL: userData.profileImg || null,
//                             });
//                             updatePromises.push(promise);
//                         }
//                     })
//             }
//             return Promise.all([updatePromises]);
//         });
//
// });