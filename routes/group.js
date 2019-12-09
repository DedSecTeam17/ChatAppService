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
            var  response = [];

            const messages = await Group.find({

            });


            let  noOfMessages = messages.length;
            let count = 0;
            messages.map( async (message)=> {
                console.log(message.from);
                var  user =await User.find({_id: mongoose.Types.ObjectId(message.from) });

                response.push({
                    "user"  : user[0] ,
                    "message" : message
                });
                count+=1;

                if (noOfMessages===count){
                    sendJsonResponse(res, response, 200);
                    next();
                }



            });





        } catch (e) {
            return next(new errors.InvalidContentError(e));
        }
    });


    server.post('/group_chat',restify_jwt({secret: process.env.JWT_SECRET}),  async (req, res, next) => {

        try {


            const {from,  message} = req.body;
            const chat = new Group({
                "from": from,
                "message": message
            });
            const newGroup = await chat.save();
            var  user =await User.find({_id: mongoose.Types.ObjectId(from) });

            pusher.trigger(`sust_group`, 'send_message', {
                "message": newGroup,
                "user" : user
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


