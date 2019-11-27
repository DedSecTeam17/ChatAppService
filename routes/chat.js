const jwt = require('jsonwebtoken');

const errors = require('restify-errors');
const Chat = require('../models/Chat');

const restify_jwt = require('restify-jwt-community');

module.exports = (server) => {
    server.post('/chat/get_messages', async (req, res, next) => {

        const {sender_pk, receiver_pk} = req.body;

        try {
            const messages = await Chat.find({
                'sender_group_public_key': sender_pk,
                'receiver_group_public_key': receiver_pk
            });

            sendJsonResponse(res, messages, 200);
            next();

        } catch (e) {
            return next(new errors.InvalidContentError(e));
        }
    });


    server.post('/chat', async (req, res, next) => {

        try {


            const {sender_pk, receiver_pk, encrypted_message} = req.body;
            const chat = new Chat({
                "sender_group_public_key": sender_pk,
                "receiver_group_public_key": receiver_pk,
                "encrypted_message": encrypted_message
            });
            const newChat = await chat.save();
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


