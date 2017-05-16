const firebase = require("firebase");

// Firebase intialization
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DB_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
};
firebase.initializeApp(config);
const db = firebase.database();

function initUser(userId) {
  return new Promise((resolve, reject) => {
    db.ref("/users/" + userId).once("value").then(function(snapshot) {
      var record = snapshot.val();
      // Return the user's record if it exists, otherwise null
      resolve(record);
      if (record === null) {
        console.log(`New user added to db, uid: ${userId}`);
        db.ref("/users/" + userId).set({
          facebookId: userId
        });
      }
    });
  });
}

module.exports = {
  initUser
};
