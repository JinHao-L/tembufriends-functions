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

    const postQueryUpdate = db
        .collectionGroup('userPosts')
        .where('sender_uid', '==', uid)
        .get()
        .then(
            (docsSnapshot) => docsSnapshot.forEach(
                doc => batch.update(doc.ref, 'sender_uid', 'deleted')
            )
        )

    return Promise.all([postQueryDelete, postQueryUpdate])
        .then(() => batch.commit())
})