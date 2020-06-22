# TembuFriends-backend

Firebase Functions which provides backend functionalities to TembuFriends app

See Tembu Friends at [link](https://github.com/JinHao-L/tembu-friends)

## Implemented backend functions
- auth/**onCreate**:
   - Create all userData on firestore and add a private welcome posts from development team
- auth/onDelete:
   - Delete all userData, posts from firestore
   
- firestore/users/**onUpdate**:
   - Echo changes in profile pages and display name to all records of the user in the firestore database
   
- firestore/posts/**create**:
   - Callable function to create posts for specified user.
- firestore/posts/**onCreate**: _(to be implemented)_
   - Trigger function that sends push notification to user

## Tech stack
**Tech used**: Firebase Functions, Firebase Authentification, Firebase Firestore, Firebase Storage, Google Cloud Storage

**Language**: Typescript

**IDE**: Intelli-J

## License
NIL
