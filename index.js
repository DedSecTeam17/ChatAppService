const restify = require('restify');
const mongoose = require('mongoose');
const restify_jwt = require('restify-jwt-community');

const cors = require('cors');

require('dotenv').load();

const server = restify.createServer();
server.use(restify.plugins.bodyParser());
server.use(cors);


// protect all routes unless registration and login entry point
// server.use(restify_jwt({secret: process.env.JWT_SECRET}).unless({path:['/auth']}));

// when server listen connect to the data base
server.listen(process.env.PORT || 5000, () => {
    mongoose.set('useFindAndModify', false);
    mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
});


const db = mongoose.connection;


db.on('error', (error) => {
    console.log(error)
});


// if we have connection opened then require route file
db.on('open', () => {
    require('./routes/sust_keys')(server);
    require('./routes/user')(server);
    console.log(`server start on port ---> ${process.env.PORT}`);
});
