import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createProfile = functions.auth.user().onCreate((user, context) => {
    const {email, displayName, uid, photoURL} = user;
    const name = displayName + " " + photoURL;
    const userData = {
        uid: uid,
        email: email,
        firstName: displayName,
        lastName: photoURL,
        displayName: name,
        modules: [],
        friendsCount: 0,
        admin: false,
        createdAt: context.timestamp
        // about
        // profileImg
        // bannerImg
        // year
        // major
        // house
        // roomNumber
    }

    const greetingsPost = {
        body: "Thanks for using TembuFriends! We are still in development phase. " +
            "Do give us your feedback and we will strive to improve!",
        isPrivate: true,
        sender_name: "TembuFriends Team",
        sender_uid: "001",
        timePosted: admin.firestore.Timestamp.now(),
        likeCount: 0,
        likes: [],
        id: "",
    }

    console.log('Creating user: ' + uid);
    const batch = admin.firestore().batch()
    const promises: Promise<any>[] = [];
    const db = admin.firestore();

    const userDataRef = db.collection('users').doc(`${uid}`)
    const postRef = db.collection('posts').doc(`${uid}`)
    const newPostRef = db.collection(`posts/${uid}/userPosts`).doc()
    greetingsPost.id = newPostRef.id;

    batch.set(userDataRef, userData, {merge: true});
    batch.set(postRef, {totalPosts: 1}, {merge: true});
    batch.set(newPostRef, greetingsPost);
    promises.push(batch.commit());

    promises.push(admin.auth()
        .updateUser(uid, {
            photoURL: undefined,
        }));

    return Promise.all(promises);
})