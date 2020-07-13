import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const auth = admin.auth();

export const getUsers = functions.https.onCall((request, context) => {
    const uidList = request;
    if (!uidList) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with ' +
            'one arguments "list" containing the list of UID to query.',
        );
    }

    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called while authenticated.',
        );
    }

    return auth.getUsers(uidList)
        .then((getUsersResult) => {
            getUsersResult.notFound.forEach((userIdentifier) => {
                console.log('Unable to find user: ', userIdentifier);
            });

            return getUsersResult.users.map(userRecord => {
                return {
                    uid: userRecord.uid,
                    displayName: userRecord.displayName,
                    profileImg: userRecord.photoURL,
                };
            });
        })
        .catch(function(error) {
            console.log('Error fetching user data:', error);
        });
});