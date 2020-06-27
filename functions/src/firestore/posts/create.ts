import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const createPost = functions.https.onCall((data, context) => {
    const body = data.body;
    const is_private = data.is_private || false;
    const receiver_uid = data.receiver_uid;
    const imgUrl = data.imgUrl;
    const imgRatio = data.imgRatio;

    if (body.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "body" containing the post message to add.');
    }

    if (!receiver_uid) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with ' +
            'one arguments "receiver_uid" containing the uid of the receiver.');
    }

    if (imgUrl && !imgRatio) {
        throw new functions.https.HttpsError('invalid-argument', 'The argument "imgUrl" have to be ' +
            'paired with the argument "imgRatio');
    }

    // Checking that the user is authenticated.
    if (!context.auth) {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
    }

    const postElements = {
        time_posted: admin.firestore.Timestamp.now(),
        likeCount: 0,
        likes: [],
        body: body,
        is_private: is_private,
        sender_img: context.auth.token.picture,
        sender_name: context.auth.token.name,
        sender_uid: context.auth.token.uid,
        receiver_uid: receiver_uid,
        post_id: "",
        imgUrl: imgUrl,
        imgRatio: imgRatio,
    }

    const batch = db.batch();

    const newPostRef = db.collection(`posts/${receiver_uid}/userPosts`).doc()
    postElements.post_id = newPostRef.id;

    batch.set(newPostRef, postElements);
    return batch.commit();
})