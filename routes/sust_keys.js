const jwt = require('jsonwebtoken');

const errors = require('restify-errors');
const Group = require('../models/Group');
const User = require('../models/User');

const restify_jwt = require('restify-jwt-community');

module.exports = (server) => {
    server.get('/sust_keys', async (req, res, next) => {
        try {
            const sust_keys = await Group.find({});

            sendJsonResponse(res, sust_keys, 200);
            next();

        } catch (e) {
            return next(new errors.InvalidContentError(e));
        }
    });


    server.get('/sust_keys/:id', async (req, res, next) => {


        try {
            const group = await Group.findById(req.params.id);

            sendJsonResponse(res, group, 200);
            next();

        } catch (e) {

            return next(new errors.ResourceNotFoundError("Group not found"));

        }

    });
    server.post('/sust_keys',restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {



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



                const {group_name, group_public_key} = req.body;
                const group = new Group({
                    "group_name" :   group_name,
                    "group_public_key" : group_public_key,
                    "user_id" : user['_id']
                });
                const newGroup = await group.save();
                sendJsonResponse(res, newGroup, 201);
                next();


                next();

            } catch (e) {
                return new next(new errors.UnauthorizedError(e));

            }
        } else {
            sendJsonResponse(res, {'message': 'Authorization header required'}, 200);
            next();
        }

    });


    server.put('/sust_keys/:id', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {
        try {
            const group = await Group.findOneAndUpdate({_id: req.params.id}, req.body);
            sendJsonResponse(res, group, 200);
            next();
        } catch (e) {
            return new next(new errors.ResourceNotFoundError(e));
        }

    });


    server.del('/sust_keys/:id', restify_jwt({secret: process.env.JWT_SECRET}), async (req, res, next) => {
        try {
            const group = await Group.findOneAndRemove({_id: req.params.id});
            sendJsonResponse(res, null, 402);
            next();
        } catch (e) {
            return new next(new errors.ResourceNotFoundError(e));
        }

    });

    function sendJsonResponse(res, data, status) {
        res.status(status);
        res.send(data);
    }

}


