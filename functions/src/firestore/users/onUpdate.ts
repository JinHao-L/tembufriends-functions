import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {isEqual} from 'lodash';

export const updateProfile = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {

        const profilePictureBefore = change.before.get('profilePicture');
        const profilePictureAfter = change.after.get('profilePicture')

        const displayNameBefore = change.before.get('displayName');
        const displayNameAfter = change.after.get('displayName');

        const uid = change.after.get('uid');

        if (!isEqual(profilePictureBefore, profilePictureAfter)
            || !isEqual(displayNameBefore, displayNameAfter)) {

            let promises : Promise<any>[] = [];

            promises.push(admin.auth()
                .updateUser(context.params.userId, {
                    photoURL: profilePictureAfter,
                    displayName: displayNameAfter,
                }))

            const postsCollectionRef = admin.firestore().collection('posts/{userId}/userPosts');
            const postQuery = postsCollectionRef.where('sender_uid', '==', uid);

            postQuery.get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        return null;
                    } else {
                        return querySnapshot.forEach(doc => {
                            promises.push(doc.ref.update({
                                sender_name: profilePictureAfter,
                                sender_uid: displayNameAfter,
                            }))
                        })
                    }
                })
            return Promise.all(promises);
        } else {
            return Promise.resolve();
        }
    })