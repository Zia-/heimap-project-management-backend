const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const pgp = require("pg-promise")(/*options*/) // /*options*/ is required
var db = pgp('postgres://heimapadmin:heimap@127.0.0.1:5432/heimap_proj_man') // Change per connection


var corsOptions = {
    origin: 'http://localhost:4201',
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
    const username = req.query.username;
    const auth_key = req.query.authkey;

    db.any('WITH user_id_select AS (SELECT p_key AS user_id FROM user_tbl WHERE username = $1) SELECT COUNT(*) FROM auth_key_tbl a, user_id_select u WHERE a.user_id = u.user_id AND a.auth_key = $2 AND a.validity = true;', [username, auth_key])
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
    const username = req.query.username;

    db.any('WITH user_id_select AS (SELECT p_key AS user_id FROM user_tbl WHERE username = $1), all_projs AS (SELECT r.proj_id FROM role_tbl r, user_id_select u WHERE r.user_id = u.user_id), all_users AS (SELECT r.user_id, r.role_proj, r.proj_id FROM role_tbl r, all_projs a WHERE r.proj_id = a.proj_id) SELECT a.proj_id, p.proj_name, u.first_name, u.last_name, u.username, a.role_proj FROM all_users a JOIN user_tbl u ON a.user_id = u.p_key JOIN proj_tbl p ON a.proj_id = p.p_key;', [username])
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
    // INSERT INTO proj_tbl, then INSERT INTO role_tbl, then UPDATE auth_key_tbl
    db.any('INSERT INTO proj_tbl (proj_name, organisation, funder, description, timestmp) VALUES ($1, $2, $3, $4, now()); WITH user_id_select AS (SELECT p_key AS user_id FROM user_tbl WHERE username = $5), proj_id_latest AS (SELECT MAX(p_key) AS proj_id FROM proj_tbl) INSERT INTO role_tbl (user_id, role_proj, proj_id) SELECT u.user_id, \'superuser\', p.proj_id FROM user_id_select u, proj_id_latest p; WITH user_id_select AS (SELECT p_key AS user_id FROM user_tbl WHERE username = $5) UPDATE auth_key_tbl SET validity = false WHERE user_id = (SELECT user_id FROM user_id_select) AND auth_key = $6; SELECT MAX(p_key) AS proj_id FROM proj_tbl LIMIT 1;', [req.body.proj_name, req.body.organisation, req.body.funder, req.body.description, req.body.username, req.body.authkey])
    .then(function (data) {
        res.status(200).send(data);
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
    if (req.body.role_proj == "Revoke!"){
        db.none('DELETE FROM role_tbl WHERE user_id = (SELECT p_key AS user_id FROM user_tbl WHERE username = $1) AND proj_id = $2;', [req.body.username, req.body.proj_id])
        .then(function (data) {
            res.status(201).send("ROLE DELETION SUCCEEDED")
        })
        .catch(function (error) {
            res.status(400).send("ROLE DELETION FAILED")
        })
    } else {
        db.none('WITH user_id_select AS (SELECT p_key AS user_id FROM user_tbl WHERE username = $1) INSERT INTO role_tbl (user_id, role_proj, proj_id) SELECT user_id, $2, $3 FROM user_id_select;', [req.body.username, req.body.role_proj, req.body.proj_id])
        .then(function (data) {
            res.status(201).send("ROLE CREATION SUCCEEDED")
        })
        .catch(function (error) {
            res.status(400).send("ROLE CREATION FAILED")
        })
    }
});

app.route('/post/authkey').post((req, res) => {
    db.none('WITH user_id_select AS (SELECT p_key AS user_id FROM user_tbl WHERE username = $1) INSERT INTO auth_key_tbl (user_id, timestmp, auth_key, validity) select user_id, now(), floor(random() * (1000000-9999999+1) + 9999999)::int, TRUE FROM user_id_select;', [req.body.username])
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