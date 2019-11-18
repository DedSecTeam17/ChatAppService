const errors = require('restify-errors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');



exports.authentication = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await  User.findOne({email});

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    // throw err;
                }
                if (isMatch) {
                    resolve(user);
                } else {
                    reject('password not match');
                }
            });

        } catch (e) {
            reject('Authentication fail');
        }
    });


}