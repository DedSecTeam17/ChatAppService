const errors = require('restify-errors');
const Group = require('../models/Group');
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

        const {group_name, group_public_key} = req.body;
        const group = new Group({
            group_name,
            group_public_key,
        });

        try {

            const newGroup = await group.save();
            sendJsonResponse(res, newGroup, 201);
            next();
        } catch (e) {
            return new next(new errors.InternalError(e));
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


