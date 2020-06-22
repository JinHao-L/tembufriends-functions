import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const createPosts = functions.https.onCall((data, context) => {

    const {body, isPrivate, receiverUid} = data;

    if (!(typeof body === 'string') || body.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "body" containing the post message to add.');
    }

    if (!receiverUid) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "receiverUid" containing the uid of the receiver.');
    }

    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }

    const postElements = {
        timePosted: admin.firestore.Timestamp.now(),
        likeCount: 0,
        likes: [],
        body: body,
        isPrivate: isPrivate || false,
        sender_img: context.auth.token.picture,
        sender_name: context.auth.token.name,
        sender_uid: context.auth.token.uid,
        id: "",
    }

    const batch = admin.firestore().batch()
    const db = admin.firestore();
    const increment = admin.firestore.FieldValue.increment(1);

    const postUpdateRef = db.collection('posts').doc(`${receiverUid}`)
    const newPostRef = db.collection(`posts/${receiverUid}/userPosts`).doc()
    postElements.id = newPostRef.id;

    batch.set(postUpdateRef, {totalPosts: increment}, {merge: true});
    batch.set(newPostRef, postElements);
    return batch.commit();
})