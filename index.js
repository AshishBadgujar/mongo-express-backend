let express = require('express');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

let mongoUrlLocal = "mongodb://localhost:27017";

let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let databaseName = "wad-db";

app.post('/register', function (req, res) {
    let userObj = req.body;
    MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
        if (err) throw err;
        let db = client.db(databaseName);

        let myquery = { email: userObj.email };

        db.collection("users").findOne(myquery, function (err, result) {
            if (err) throw err;
            if (result) {
                res.send({ err: "user exist" })
            } else {
                db.collection("users").insertOne(userObj, function (err, result) {
                    if (err) throw err
                    client.close();
                    res.send(result ? result : {});
                });
            }
        });
    });
});

app.post('/update', function (req, res) {
    let userObj = req.body;

    MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        let myquery = { email: userObj.email };
        let newvalues = { $set: userObj };
        db.collection("users").updateOne(myquery, newvalues, { upsert: true }, function (err, res) {
            if (err) throw err;
            client.close();
        });

    });
    res.send(userObj);
});

app.delete('/:id', function (req, res) {
    let id = req.params.id;
    MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        let myquery = { email: id };

        db.collection("users").findOneAndDelete(myquery, function (err, result) {
            if (err) throw err;
            response = result;
            client.close();

            res.send(response ? response : {});
        });
    });
})

app.get('/:id', function (req, res) {
    let response = {};
    let id = req.params.id;
    MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
        if (err) throw err;

        let db = client.db(databaseName);
        let myquery = { email: id };

        db.collection("users").findOne(myquery, function (err, result) {
            if (err) throw err;
            response = result;
            client.close();

            res.send(response ? response : {});
        });
    });
});
// app.get('/all', function (req, res) {
//     let response = {};
//     MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
//         if (err) throw err;

//         let db = client.db(databaseName);
//         response = db.collection("users").find()
//         client.close();

//         res.send(response ? response : {});
//     });
// });

app.listen(3000, function () {
    console.log("app listening on port 3000!");
});
