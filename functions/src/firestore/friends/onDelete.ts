import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const removeFriend = functions.firestore
    .document('friends/{friendId}')
    .onDelete((snapshot, context) => {
        const deletedBond = snapshot.data();
        const deletedStatus = deletedBond.status;

        const initiator = deletedBond.initiator_uid;
        const requested = deletedBond.requested_uid;

        const decrement = admin.firestore.FieldValue.increment(-1);

        if (deletedStatus === 'friends') {
            const batch = db.batch();

            const initiatorUserRef = db.collection('users').doc(`${initiator}`);
            batch.update(initiatorUserRef, { friendsCount: decrement });

            const requestedUserRef = db.collection('users').doc(`${requested}`);
            batch.update(requestedUserRef, { friendsCount: decrement });

            return batch.commit();
        }

        return Promise.resolve();
    });
