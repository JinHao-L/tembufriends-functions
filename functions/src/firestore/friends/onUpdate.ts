import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const addFriend = functions.firestore
    .document('friends/{friendId}')
    .onUpdate((change, context) => {
        const newChanges = change.after.data();
        const newStatus = newChanges.status;
        const previousStatus = change.before.data().status;

        const increment = admin.firestore.FieldValue.increment(1);

        if (previousStatus === 'pending' && newStatus === 'friends') {
            const batch = db.batch();
            const initiator = newChanges.initiator_uid;
            const requested = newChanges.requested_uid;
            const promise = admin
                .auth()
                .getUser(requested)
                .then((user) => {
                    if (user) {
                        const requested_name = user.displayName;

                        const notification = {
                            type: 'FriendAccepted',
                            uid: requested,
                            message: `${requested_name} accepted your friend request:`,
                            timeCreated: admin.firestore.Timestamp.now(),
                            notification_id: '',
                            seen: false,
                        };

                        const notificationRef = db
                            .collection(`notifications/${initiator}/notification`)
                            .doc();
                        notification.notification_id = notificationRef.id;
                        batch.set(notificationRef, notification);
                    }
                });

            const initiatorUserRef = db.collection('users').doc(`${initiator}`);
            batch.update(initiatorUserRef, { friendsCount: increment });

            const requestedUserRef = db.collection('users').doc(`${requested}`);
            batch.update(requestedUserRef, { friendsCount: increment });

            return Promise.all([promise]).then(() => batch.commit());
        }

        return Promise.resolve();
    });
