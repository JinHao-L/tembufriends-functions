import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();
const auth = admin.auth();

export const createProfile = functions.https.onCall((user, context) => {
    const uid = user.uid;
    const email = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;

    const userData = {
        uid: uid,
        email: email,
        firstName: firstName,
        lastName: lastName,
        displayName: firstName + ' ' + lastName,
        friendsCount: 0,
        admin: false,
        createdAt: admin.firestore.Timestamp.now(),
        verified: false,
    };

    const greetingsPost = {
        body: 'Thanks for using TembuFriends! We are still in development phase. ' +
            'Do give us your feedback and we will strive to improve!',
        is_private: true,
        receiver_uid: uid,
        sender_name: 'TembuFriends Team',
        time_posted: admin.firestore.Timestamp.now(),
        likes: [],
        post_id: '',
    };
    const batch = db.batch();
    // User profile
    const newUserRef = db.collection('users').doc(uid);
    batch.set(newUserRef, userData);

    // Welcome post
    const newPostRef = db.collection(`posts/${uid}/userPosts`).doc();
    greetingsPost.post_id = newPostRef.id;
    batch.set(newPostRef, greetingsPost);

    return batch.commit()
        .then(() => auth.setCustomUserClaims(uid, {
            admin: false,
            verified: false,
        }));
});