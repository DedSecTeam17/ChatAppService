const jwt = require('jsonwebtoken');

const errors = require('restify-errors');
const Chat = require('../models/Chat');

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
    server.post('/chat/get_messages', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {

        const {from: from, to} = req.body;

        try {
            const messages = await Chat.find({
                $or: [{
                    'from': from,
                    'to': to
                }, {
                    'from': to,
                    'to': from
                }]
            });
            sendJsonResponse(res, messages, 200);
            next();
        } catch (e) {
            return next(new errors.InvalidContentError(e));
        }
    });


    server.post('/chat', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {

        try {


            const {from, to, message} = req.body;
            const chat = new Chat({
                "from": from,
                "to": to,
                "message": message
            });
            const newChat = await chat.save();

            pusher.trigger(`messages-${from}-${to}`, 'send_message', {
                "message": newChat
            });

            console.log("Message sent successfully-------->");


            sendJsonResponse(res, newChat, 201);
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


