const mongoose = require('mongoose');

// mongoose.connect('mongodb+srv://bhargavsarvaria:bhargav19@mywaitlist.abq9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', ()=>{
//     console.log('Connected to Mongo db');
// });

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://bhargavsarvaria:bhargav19@mywaitlist.abq9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('Connected to Mongo db');
  const collection = client.db("myWaitlist").collection("users");
  // perform actions on the collection object
  client.close();
});
