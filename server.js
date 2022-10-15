//Install express server
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
// require('dotenv').config({ path: '.env' });

const app = express();

const api = require('./server/routes/api');

app.use(express.static('./dist/myWaitlist'));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', api);


// Serve only the static files form the dist directory
app.get('/*', (req, res) =>
    res.sendFile('index.html', { root: 'dist/my-waitlist/' }),
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, (req, res) => {
    console.log('Running')
});