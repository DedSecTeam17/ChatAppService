const errors = require('restify-errors');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const restify_jwt = require('restify-jwt-community');

require('dotenv').load();


const jwt = require('jsonwebtoken');
const {authentication} = require('../auth');


module.exports = (server) => {


    // Register the user
    server.post('/users', (req, res, next) => {
        const {email, password} = req.body;
        const newUser = new User({
            email,
            password
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

    server.post('/auth', async (req, res, next) => {
        const {email, password} = req.body;

        try {

            const user = await authentication(email, password);

            // signing process using user object and client secret

            const user_token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {expiresIn: '1y'});
            const {iat, exp} = jwt.decode(user_token);

            sendJsonResponse(res, {iat, exp, user_token}, 200);
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


    function sendJsonResponse(res, data, status) {
        res.status(status);
        res.send(data);
    }


}
