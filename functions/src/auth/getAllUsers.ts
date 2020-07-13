import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const auth = admin.auth();

export const getAllUsers = functions.https.onCall((request, context) => {

    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called while authenticated.',
        );
    }

    return auth.listUsers()
        .then((listUserResult) => listUserResult.users)
        .then(userRecords => {
            return userRecords.map((user) => {
                const { uid, photoURL, displayName, email, emailVerified, customClaims } = user;
                return {
                    uid: uid,
                    photoURL: photoURL,
                    displayName: displayName,
                    email: email,
                    emailVerified: emailVerified,
                    isAdmin: customClaims?.admin,
                    isVerified: customClaims?.verified,
                };
            });
        });
});