import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const deleteProfile = functions.auth.user().onDelete((user) => {
    const {uid} = user;
    return admin.firestore()
        .collection('users')
        .doc(`${uid}`)
        .delete();
})