// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const config = require('../config');
const magicbox_url = config.magicbox_url;
const app = express();
const Request = require('superagent');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


const forward_get = (req, res, next) => {
  const url = `${magicbox_url}${req.originalUrl}`
  console.info(`FORWARD GET: magicbox ${url}`)
  Request
    .get(`${url}`)
    .then(response => {
      res.json(JSON.parse(response.text));
    })
    .catch(err => res.status(405).send(err))
}



// // Support Gzip
// app.use(compression())

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));


app.get('/population', forward_get)

app.get('/population/:format/:country', forward_get)

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.listen(2400, function () {
  console.log('Example app listening on port 2400!')
})
module.exports = app;
