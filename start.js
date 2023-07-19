const mongoose = require('mongoose');
const axios = require('axios')

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 7 || (major === 7 && minor <= 5)) {
  console.log('🛑 🌮 🐶 💪 💩\nHey You! \n\t ya you! \n\t\tBuster! \n\tYou\'re on an older version of node that doesn\'t support the latest and greatest things we are learning (Async + Await)! Please go to nodejs.org and download version 7.6 or greater. 👌\n ');
  process.exit();
}


// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go!


//import all models
require('./models/Store')

const init = async () => {
  const token = process.env.TOKEN
  const serverUrl = process.env.SERVER_URL
  const TELEGRAM_API = `https://api.telegram.org/bot${token}`
  const URI = `/webhook/${token}`
  const WEBHOOK_URL = serverUrl + URI

  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
  console.log('====================================');
  console.log(res.data);
  console.log('====================================');
}


init()



// Start our app!
const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
