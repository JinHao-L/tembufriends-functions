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
            const promises = [];

            const initiatorUserRef = db.collection('users').doc(`${initiator}`);
            promises.push(initiatorUserRef.update('friendsCount', decrement));

            const requestedUserRef = db.collection('users').doc(`${requested}`);
            promises.push(requestedUserRef.update('friendsCount', decrement));

            return Promise.all(promises);
        }

        return Promise.resolve();
    });
