const express = require('express');
const uri = process.env.DB_CONNECTION;
const cuttly_key = process.env.CUTTLY_KEY;
const SMS_KEY = process.env.SMS_KEY;
const APP_URL = 'https://easywaitlist.herokuapp.com/';
const SMS_URL = "https://www.fast2sms.com/dev/bulk";
const MongoClient = require('mongodb').MongoClient;
const common = require('../utils/common')
const axios = require('axios');


var database = null;
var users = null;
 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect( async () =>{
    try {
        database = await client.db('myWaitlist');
        users = await database.collection('users');
      }catch(err){
          console.log(err);
      }
});


const router = express.Router();

router.get('/', async (req, res) => {
    try{
        await users.find({}).toArray(function(err, result) {
            if (err) res.json({ message: err.message});
            res.json(result);
        });
    }catch(err){
        res.json({ message: err.message});
    } 
});

router.post('/login', async (req, res) => {
    try{
        await users.findOne({email: req.body.email}, function(err, result) {
            if (err) res.json({ message: err.message});
            if(result == null){ 
                res.json({error: true, message:'Couldn\'t find your email address'});
            }else{
                if(req.body.password == result.password){
                    res.json({success: true, _id: String(result._id)});
                }else{
                    res.json({error: true, message:'The password entered is incorrect'});
                }
            }
        });
    }catch(err){
        res.json({error: true, message:err.message});
    } 
});

router.post('/register', async (req, res) => {
    try{
        var hash = ( await common.stringToHash(req.body.email) ) % ( 10 ** 6 )

        users.findOne({ "$or": [{ _id: hash }, { email: req.body.email }, { mobile_no: req.body.mobile_no }] }, async function(err, result){
            if (err) res.json({ message: err.message});
            if(result == null){ 
                // Add User into table
                var myobj = req.body;
                myobj['_id'] = hash;

                users.insertOne(myobj, function(err, result) {
                    if (err) res.json({ message: err.message});
                    if(result.hasOwnProperty('insertedCount')){
                        console.log(result.insertedCount)
                        if(result.insertedCount){
                            res.json({success: true, '_id': hash});
                        }else{
                            res.json({error: true, message:'Failed to register. Please contact suport'});
                        }
                    }
                });

            }else{
                var message = ''
                if (result._id == hash){
                    message  = 'Failed to register. Please contact suport';
                } else if (result.email == req.body.email){
                    message  = 'Given Email-id is already registered';
                } else if (result.mobile_no == req.body.mobile_no){
                    message  = 'Given Mobile No. is already registered';
                }
                res.json({error: true, message:message});
            }
        });
    }catch(err){
        res.json({error: true, message:err.message});
    }
});

router.get('/getWaitlist', async (req, res) => {
    try{
        var place_id  = req.query.place_id;
        await database.collection(place_id).find({}).toArray(function(err, result) {
            if (err) res.json({ error: true});
            res.json({success: true, data: result});
        });
    }catch(err){
        res.json({ error: true});
    } 
});

router.get('/test', async(req, res) => {
    var shortLink = 'http://yeh.le';

    axios.post(SMS_URL, {
        sender_id: 'CHKSMS',
        language: 'english',
        route: 'p',
        numbers: '8369398163',
        message: 'Hi ' + ', \nTrack your possition in waiting through the below link.\n' + shortLink
    }, {
        headers: {
            "authorization" : SMS_KEY,
            "Content-Type" : 'application/json',
            "Cache-Control" : 'no-cache'
        }
      })
    .then((response) => {
        console.log(response.data);
        res.json(response.data.return);
    }, (error) => {
        console.log(error.message)
        res.json(error);
    });
});

router.get('/getWaitlistPos', async (req, res) => {
    try{
        var place_id  = req.query.place_id;
        await database.collection(place_id).find({}, {_id: 0, wait_id: 1, name: 1}).toArray(function(err, result) {
            if (err) res.json({ error: true});
            res.json({success: true, data: result});
        });
    }catch(err){
        res.json({ error: true});
    } 
});

router.post('/getPlaceName', async (req, res) => {
    try{
        await users.findOne({_id: parseInt(req.body.place_id)}, function(err, result) {
            if (err) res.json({error: true, message:'Couldn\'t find mentioned place'});
            if(result == null){ 
                res.json({error: true, message:'Couldn\'t find mentioned place'});
            }else{
                res.json({success: true, place_name: String(result.name)});
            }
        });
    }catch(err){
        res.json({error: true, message:'Couldn\'t find mentioned place'});
    } 
});

router.post('/isServed', async (req, res) => {
    try{

        var place_id = req.body.place_id;
        var wait_id = parseInt(req.body.wait_id);

        await database.collection(place_id + ' served').findOne({wait_id: wait_id}, function(err, result) {
            if (err) res.json({error: true, message:'Couldn\'t find mentioned waiting'});
            if(result == null){ 
                res.json({success: true, is_served: false});
            }else{
                res.json({success: true, is_served: true});
            }
        });
    }catch(err){
        res.json({error: true, message:'Couldn\'t find mentioned waiting'});
    } 
});

router.post('/setWaitlist', async (req, res) => {
    try{
        var place_id  = req.body.place_id; var user = req.body.user; var waitlist = req.body.users; var request_type = req.body.request_type;

        if(request_type == 'Remove'){
            database.collection(place_id + ' served').insertOne(user, function(err, result) {});
        }else if(request_type == 'Undo'){
            database.collection(place_id + ' served').deleteOne({wait_id: user.wait_id}, function(err, result) {});
        }

        if(waitlist.length == 0){
            database.collection(place_id).drop(function(err, delOK) {
                if (err) res.json({ error: true});
                if (delOK) res.json({ success: true});
            });
        }else{
            await database.collection(place_id).deleteMany({}, function(err) {
                if (err){ res.json({ error: true}) }else{
                database.collection(place_id).insertMany(waitlist, function(err, inserManyResult) {
                    if (err) { res.json({ error: true}); }else{
                        if(request_type == 'Add'){
                            var url = APP_URL + 'lobby/' + place_id + '?wid=' + user.wait_id;
                            var api_url = 'https://cutt.ly/api/api.php?key='+cuttly_key+'&short='+url;

                            axios.get(api_url).then((response) =>{
                                if(response.data.hasOwnProperty('url') && response.data.url.hasOwnProperty('shortLink') ){
                                    var shortLink = response.data.url.shortLink;

                                    axios.post(SMS_URL, {
                                        sender_id: 'CHKSMS',
                                        language: 'english',
                                        route: 'p',
                                        numbers: user.mobile_no,
                                        message: 'Hi '+ user.name + ', \nTrack your possition in waiting through the below link.\n' + shortLink
                                    }, {
                                        headers: { "authorization" : SMS_KEY, "Content-Type" : 'application/json', "Cache-Control" : 'no-cache' }
                                    })
                                    .then((response) => {
                                        if(response.data.hasOwnProperty('return') && response.data.return ){
                                            res.json({success: true});
                                        }else{
                                            res.json({error: true});
                                        }

                                    }, (error) => {
                                        console.log(error.message)
                                        res.json(error);
                                    });

                                }else{
                                    res.json({ error: true});
                                }     
                            }).catch((error) => {
                                res.status(500).send(error);
                            })
                        }else{
                            res.json({success: true});
                        }
                    }
                });}
            });
        }
    }catch(err){
        console.log(err.message);
        res.json({ error: true, message: err.message});
    } 
});


module.exports = router;