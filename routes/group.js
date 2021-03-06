const jwt = require('jsonwebtoken');

const errors = require('restify-errors');
const Group = require('../models/Group');
const User = require('../models/User');
const  mongoose = require('mongoose');

const restify_jwt = require('restify-jwt-community');

var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '912791',
    key: 'c43c8e473ffba0fd0a14',
    secret: 'd1071036bd8eaa57e1ba',
    cluster: 'mt1',
    encrypted: true
});



module.exports = (server) => {
    server.get('/group_chat/get_messages', async (req, res, next) => {

        try {

            const messages = await Group.find({

            });

            sendJsonResponse(res, messages, 200);
            next();




        } catch (e) {
            return next(new errors.InvalidContentError(e));
        }
    });


    server.post('/group_chat',restify_jwt({secret: process.env.JWT_SECRET}),  async (req, res, next) => {

        try {


            const {from,  message,name} = req.body;
            const chat = new Group({
                "from": from,
                "message": message,
                "name" : name
            });
            const newGroup = await chat.save();

            pusher.trigger(`sust_group`, 'send_message', {
                "message" : newGroup
            });

            console.log("Message sent successfully-------->");


            sendJsonResponse(res, newGroup, 201);
            next();


            next();

        } catch (e) {
            return new next(new errors.UnauthorizedError(e));

        }

    });




    function sendJsonResponse(res, data, status) {
        res.status(status);
        res.send(data);
    }

}


