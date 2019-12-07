const errors = require('restify-errors');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const restify_jwt = require('restify-jwt-community');

require('dotenv').load();
var Pusher = require('pusher');


const jwt = require('jsonwebtoken');
const {authentication} = require('../auth');


var pusher = new Pusher({
    appId: '912791',
    key: 'c43c8e473ffba0fd0a14',
    secret: 'd1071036bd8eaa57e1ba',
    cluster: 'mt1',
    encrypted: true
});

module.exports = (server) => {


    // Register the user
    server.post('/users', (req, res, next) => {
        const {email, password, userName, online} = req.body;
        const newUser = new User({
            email,
            password,
            userName,
            online
        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, async (err, hashedPassword) => {
                newUser.password = hashedPassword;
                try {
                    var savedUser = await newUser.save();
                    sendJsonResponse(res, savedUser, 201);
                    next();
                } catch (e) {
                    return new next(new errors.InternalError(e));
                }
            });
        });
    });


    server.get('/users/index', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {

        if (req.headers && req.headers.authorization) {
            const authorization_header = req.headers.authorization;
            const size = authorization_header.length;

            // substring JWT string from header  with space to get clean token
            const user_token = authorization_header.substr(4, size);
            next();

            try {

                // decode user model using jwt verify using client secret and and clean token
                const decoded_user = jwt.verify(user_token, process.env.JWT_SECRET);

                // find user using id from decoded user
                const users = await User.find({online : true,_id : {$ne :decoded_user._id}});
                sendJsonResponse(res, users, 200);
                next();

            } catch (e) {
                return new next(new errors.UnauthorizedError(e));

            }
        } else {
            sendJsonResponse(res, {'message': 'Authorization header required'}, 200);
            next();
        }


    });


    server.post('/auth', async (req, res, next) => {
        const {email, password} = req.body;

        try {

            const user = await authentication(email, password);

            // signing process using user object and client secret

            const user_token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {expiresIn: '1y'});
            const data = jwt.decode(user_token);

            sendJsonResponse(res, {

                "u_id": data['_id'],
                "iat": data['iat'],
                "exp": data["exp"],
                "token": user_token
            }, 200);
            next();

        } catch (e) {
            return new next(new errors.UnauthorizedError(e));

        }

    });


    server.get('/users', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {

        if (req.headers && req.headers.authorization) {
            const authorization_header = req.headers.authorization;
            const size = authorization_header.length;

            // substring JWT string from header  with space to get clean token
            const user_token = authorization_header.substr(4, size);
            next();

            try {

                // decode user model using jwt verify using client secret and and clean token
                const decoded_user = jwt.verify(user_token, process.env.JWT_SECRET);

                // find user using id from decoded user
                const user = await User.findById(decoded_user._id);
                sendJsonResponse(res, user, 200);
                next();

            } catch (e) {
                return new next(new errors.UnauthorizedError(e));

            }
        } else {
            sendJsonResponse(res, {'message': 'Authorization header required'}, 200);
            next();
        }


    });


    server.get('/users/connected', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {

        if (req.headers && req.headers.authorization) {
            const authorization_header = req.headers.authorization;
            const size = authorization_header.length;

            // substring JWT string from header  with space to get clean token
            const user_token = authorization_header.substr(4, size);
            next();

            try {

                // decode user model using jwt verify using client secret and and clean token
                const decoded_user = jwt.verify(user_token, process.env.JWT_SECRET);

                // find user using id from decoded user
                // const user = await User.findById(decoded_user._id);
                const newUser = await User.findOneAndUpdate({_id: decoded_user._id}, {online: true});
                const user = await User.findById(decoded_user._id);


                pusher.trigger(`attach_chat`, 'connected', {
                    "user": user
                });

                sendJsonResponse(res, user, 200);
                next();

            } catch (e) {
                return new next(new errors.UnauthorizedError(e));

            }
        } else {
            sendJsonResponse(res, {'message': 'Authorization header required'}, 200);
            next();
        }


    });


    server.get('/users/disconnected', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {

        if (req.headers && req.headers.authorization) {
            const authorization_header = req.headers.authorization;
            const size = authorization_header.length;

            // substring JWT string from header  with space to get clean token
            const user_token = authorization_header.substr(4, size);
            next();

            try {

                // decode user model using jwt verify using client secret and and clean token
                const decoded_user = jwt.verify(user_token, process.env.JWT_SECRET);


                // find user using id from decoded user
                // const user = await User.findById(decoded_user._id);
                const newUser = await User.findOneAndUpdate({_id: decoded_user._id}, {online: false});
                const user = await User.findById(decoded_user._id);

                pusher.trigger(`attach_chat`, 'disconnected', {
                    "user": user
                });

                sendJsonResponse(res, user, 200);
                next();
            } catch (e) {
                return new next(new errors.UnauthorizedError(e));

            }
        } else {
            sendJsonResponse(res, {'message': 'Authorization header required'}, 200);
            next();
        }


    });

    function sendJsonResponse(res, data, status) {
        res.status(status);
        res.send(data);
    }


}
