import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const auth = admin.auth();

export const emailVerify = functions.https.onCall((request, context) => {
    if (request.uid) {
        return auth.updateUser(request, {
            emailVerified: true
        });
    } else {
        return Promise.resolve();
    }
})