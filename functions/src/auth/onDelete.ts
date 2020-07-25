import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const deleteProfile = functions.auth.user().onDelete((user) => {
    const {uid} = user;

    const batch = db.batch();

    const userDataRef = db.collection('users').doc(`${uid}`)
    batch.delete(userDataRef)

    const postQueryDelete = db
        .collection(`posts/${uid}/userPosts`)
        .listDocuments()
        .then((docs) =>
            docs.forEach(doc => batch.delete(doc))
        );

    const deleteFriends = db
        .collection('friends')
        .where(`friendship.${uid}`, '==', true)
        .get()
        .then(
            (docsSnapshot) => docsSnapshot.forEach(
                doc => batch.delete(doc.ref)
            )
        )

    return Promise.all([postQueryDelete, deleteFriends])
        .then(() => batch.commit())
})