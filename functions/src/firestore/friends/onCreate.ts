import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const friendRequest = functions.https.onCall((request, context) => {
    const requested_uid = request.uid;

    if (!requested_uid) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with ' +
                'one arguments "uid" containing the uid of the receiver.'
        );
    }
    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called ' + 'while authenticated.'
        );
    }

    const initiator_uid = context.auth.uid;
    const initiator_name = context.auth.token.name || 'User';

    const bond = {
        friendship: {
            [requested_uid]: true,
            [initiator_uid]: true,
        },
        friendship_id: '',
        status: 'pending',
        initiator_uid: initiator_uid,
        requested_uid: requested_uid,
    };

    const notification = {
        type: 'FriendRequest',
        uid: initiator_uid,
        message: `${initiator_name} sent you a new friend request:`,
        timeCreated: admin.firestore.Timestamp.now(),
        notification_id: '',
        seen: false,
    };
    const batch = db.batch();

    const notificationRef = admin
        .firestore()
        .collection(`notifications/${requested_uid}/notification`)
        .doc();
    notification.notification_id = notificationRef.id;

    const friendsRef = db.collection('friends').doc(notificationRef.id);
    bond.friendship_id = notificationRef.id;

    batch.set(friendsRef, bond);
    batch.set(notificationRef, notification);
    return batch.commit();
});
