import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const updateProfile = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        const profilePictureBefore = change.before.get('profileImg');
        const profilePictureAfter = change.after.get('profileImg');

        const displayNameBefore = change.before.get('displayName');
        const displayNameAfter = change.after.get('displayName');

        const uid = change.after.get('uid');

        if (
            profilePictureBefore !== profilePictureAfter ||
            displayNameBefore !== displayNameAfter
        ) {
            console.log('Changes detected');

            const profilePictureChanges =
                profilePictureBefore !== profilePictureAfter ? profilePictureAfter : undefined;

            const displayNameChanges =
                displayNameBefore !== displayNameAfter ? displayNameAfter : undefined;

            const batch = db.batch();
            const postQueryUpdate = db
                .collectionGroup('userPosts')
                .where('sender_uid', '==', uid)
                .get()
                .then((docsSnapshot) =>
                    docsSnapshot.forEach((doc) =>
                        batch.update(doc.ref, {
                            sender_img: profilePictureChanges,
                            sender_name: displayNameChanges,
                        })
                    )
                );

            return postQueryUpdate.then(() => batch.commit());
        } else {
            return Promise.resolve();
        }
    });
