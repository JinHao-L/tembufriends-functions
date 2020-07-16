import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const friendRequest = functions.https.onCall((request, context) => {
    const requested_uid = request.uid;
    const expoPushToken = request.expoPushToken;

    if (!requested_uid) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with ' +
            'one arguments "uid" containing the uid of the receiver.',
        );
    }
    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called ' + 'while authenticated.',
        );
    }

    const initiator_uid = context.auth.uid;
    console.log(context.auth.token.name);

    const bond = {
        friendship: {
            [requested_uid]: true,
            [initiator_uid]: true,
        },
        friendship_id: '',
        status: 'pending',
        initiator_uid: initiator_uid,
        requested_uid: requested_uid,
        time_requested: admin.firestore.Timestamp.now(),
        seen: false,
        expoPushToken: expoPushToken,
    };

    const batch = db.batch();

    const friendsRef = db.collection('friends').doc();
    bond.friendship_id = friendsRef.id;

    batch.set(friendsRef, bond);
    return batch.commit();
});
