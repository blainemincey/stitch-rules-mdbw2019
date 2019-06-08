// Simple test Node script for testing Stitch Rules
const {
    Stitch,
    RemoteMongoClient,
    UserPasswordCredential
} = require('mongodb-stitch-server-sdk');

// Change these variables
let myAppId = 'stitch-rules-application-ttmgw';

// If following the tutorial, use Child, Teen, or Adult
let username = 'Child';

// same password for all unless you changed it
let password = 'myPassword';

const client = Stitch.initializeDefaultAppClient(myAppId);
const db = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db('sample_mflix');

let credential = new UserPasswordCredential(username, password);

client.auth.loginWithCredential(credential).then(user => {
    console.log(`User logged in: ${user.profile.data.email}`)
    })
    .then(() =>
    db.collection('movies').find({},
        {
            projection: {_id: 0, title: 1, rated: 1, "imdb.rating": 1, year: 1, poster: 1},
            limit: 50
        }).asArray()
    )
    .then(docs => {
        console.log(docs);
        client.close();
    })
    .catch(err => {
        console.error(err);
        client.close();
    })