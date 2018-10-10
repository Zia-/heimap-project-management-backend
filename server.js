const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const pgp = require("pg-promise")(/*options*/) // /*options*/ is required
var db = pgp('postgres://heimapadmin:heimap@127.0.0.1:5432/heimap_proj_man') // Change per connection


var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions))

app.listen(8080, () => {
    console.log('Server started!');
});

// GET ------------

app.route('/api/cats').get((req, res) => {
    // res.send({
    //     cats: [{ name: 'lilly' }, { name: 'lucy' }]
    // });
    res.status(200).send({
        cats: [{ name: 'lilly1' }, { name: 'lucy' }]
    });
});

app.route('/get/username/availability').get((req, res) => {
    const username = req.query.username;

    db.any('SELECT COUNT(*) FROM user_tbl WHERE username = $1;', [username])
    .then(function (data) {
        res.status(200).send((data[0]['count']>0) ? false : true);
    })
    .catch(function (error) {
        res.status(400).send("USER AVAILABILITY FAILED")
    })
});

app.route('/get/authkey/availability').get((req, res) => {
    const userid = req.query.userid;
    const auth_key = req.query.authkey;

    db.any('SELECT COUNT(*) FROM auth_key_tbl WHERE user_id = $1 AND auth_key = $2 AND validity = true;', [userid, auth_key])
    .then(function (data) {
        res.status(200).send((data[0]['count']>0) ? true : false);
    })
    .catch(function (error) {
        res.status(400).send("AUTHORISATION KEY AVAILABILITY FAILED")
    })
});

app.route('/get/emailid/availability').get((req, res) => {
    const emailid = req.query.emailid;

    db.any('SELECT COUNT(*) FROM user_tbl WHERE email = $1;', [emailid])
    .then(function (data) {
        res.status(200).send((data[0]['count']>0) ? false : true);
    })
    .catch(function (error) {
        res.status(400).send("EMAIL ID AVAILABILITY FAILED")
    })
});

app.route('/get/login/check').get((req, res) => {
    const username = req.query.username;
    const pass = req.query.pass;

    db.any('SELECT COUNT(*) FROM user_tbl WHERE username = $1 AND pass = $2;', [username, pass])
    .then(function (data) {
        res.status(200).send((data[0]['count']>0) ? true : false);
    })
    .catch(function (error) {
        res.status(400).send("LOGIN CHECK FAILED")
    })
});

app.route('/get/pass/recover').get((req, res) => {
    const emailid = req.query.emailid;

    // db.any('SELECT COUNT(*) FROM user_tbl WHERE email = $1;', [emailid])
    // .then(function (data) {
    //     res.status(200).send((data[0]['count']>0) ? false : true);
    // })
    // .catch(function (error) {
    //     res.status(400).send("EMAIL ID AVAILABILITY FAILED")
    // })
});

app.route('/get/proj/role').get((req, res) => {
    const userid = req.query.userid;

    db.any('SELECT r.role_proj, p.proj_name FROM role_tbl r JOIN proj_tbl p ON r.proj_id = p.p_key WHERE r.user_id = $1;', [userid])
    .then(function (data) {
        res.status(200).send(data);
    })
    .catch(function (error) {
        res.status(400).send("PROJECT ROLE RECOVERY FAILED")
    })
});

// POST ------------

app.use(bodyParser.json());

app.route('/post/proj').post((req, res) => {
    db.none('INSERT INTO proj_tbl (proj_name, organisation, funder, description, timestmp) VALUES ($1, $2, $3, $4, now());', [req.body.proj_name, req.body.organisation, req.body.funder, req.body.description])
    .then(function (data) {
        res.status(201).send("PROJECT CREATION SUCCEEDED")
    })
    .catch(function (error) {
        res.status(400).send("PROJECT CREATION FAILED")
    })
});

app.route('/post/user').post((req, res) => {
    db.none('INSERT INTO user_tbl (first_name, last_name, email, username, pass, organisation, about, timestmp) VALUES ($1, $2, $3, $4, $5, $6, $7, now());', [req.body.first_name, req.body.last_name, req.body.email, req.body.username, req.body.pass, req.body.organisation, req.body.about])
    .then(function (data) {
        res.status(201).send("USER CREATION SUCCEEDED")
    })
    .catch(function (error) {
        res.status(400).send("USER CREATION FAILED")
    })
});

app.route('/post/role').post((req, res) => {
    db.none('INSERT INTO role_tbl (user_id, role_proj, proj_id) VALUES ($1, $2, $3);', [req.body.user_id, req.body.role_proj, req.body.proj_id])
    .then(function (data) {
        res.status(201).send("ROLE CREATION SUCCEEDED")
    })
    .catch(function (error) {
        res.status(400).send("ROLE CREATION FAILED")
    })
});

app.route('/post/authkey').post((req, res) => {
    db.none('INSERT INTO auth_key_tbl (user_id, timestmp, auth_key, validity) VALUES ($1, now(), floor(random() * (1000000-9999999+1) + 9999999)::int, TRUE);', [req.body.user_id])
    .then(function (data) {
        res.status(201).send("AUTHORISATION KEY CREATION SUCCEEDED")
    })
    .catch(function (error) {
        res.status(400).send("AUTHORISATION KEY CREATION FAILED")
    })
});

// app.use(bodyParser.json());
// app.post('/login',function(req,res){
//     // var user_name=req.body.user;
//     // var password=req.body.password;
//     console.log("t");
//     console.log(req.body.ddd);
//     console.log("z");
//     // res.end("yes");
//   });