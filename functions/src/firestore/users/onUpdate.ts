import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const auth = admin.auth();

export const updateProfile = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        const profilePictureBefore = change.before.get('profileImg');
        const profilePictureAfter = change.after.get('profileImg');

        const displayNameBefore = change.before.get('displayName');
        const displayNameAfter = change.after.get('displayName');

        const adminBefore = change.before.get('admin');
        const adminAfter = change.after.get('admin');

        const verifiedBefore = change.before.get('verified');
        const verifiedAfter = change.after.get('verified');

        const uid = change.after.get('uid');

        if (profilePictureBefore !== profilePictureAfter || displayNameBefore !== displayNameAfter) {
            console.log('Changes Detected');

            const batch = db.batch();
            const postQueryUpdate = db
                .collectionGroup('userPosts')
                .where('sender_uid', '==', uid)
                .get()
                .then((docsSnapshot) => {
                    const updates = {
                        sender_img: profilePictureAfter,
                        sender_name: displayNameAfter,
                    };
                    docsSnapshot.forEach((doc) => batch.update(doc.ref, updates));
                });

            return postQueryUpdate.then(() => batch.commit());
        } else if (adminBefore !== adminAfter || verifiedBefore !== verifiedAfter) {
            console.log('User Claims Changed');

            return auth.setCustomUserClaims(uid, {
                verified: verifiedAfter,
                admin: adminAfter,
            });
        } else {
            return Promise.resolve();
        }
    });
