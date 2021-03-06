const jwt = require('jwt-simple');
const User = require('../model/user');
const config = require('../config');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    console.log('user:\n',user.id);
    return jwt.encode({
            sub: user.id, 
            iat: timestamp 
        }, config.secret);
}

exports.signup = function(req, res, next) {
    //Create User entity
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });
    //Validate errors
    const errors = validateSignup(user);
    if(errors.length > 0) {
        let reponseObj = {};
        errors.forEach(function(error, i) {
            reponseObj[error[0]] = error[1];
        });
        return res.status(422).send(reponseObj);
    }
    //See if a user with given email exists
    User.findOne({ email: user.email}, function(error, existingUser) {
        if(error) {
            return next(error);
        }
        //If a user with email does exist, return an error
        if(existingUser) {
            return res.status(422).send({ error: 'Email is already in use'});
        }
    })
    //If a user with email does not exist save user record
    user.save(function(error){
        if(error) {
            return next(error);
        }    
        //Respond to request indicating that user was created
        res.json({ token: tokenForUser(user) }); 
    });
    
    function validateSignup(user){
        const errors = [];
        const email = 'email';
        const password = 'password';

        if(!user[email] && errors.indexOf(email) === -1) { 
            errors.push([email, "Email cannot be empty"]) 
        };
        if(!user[password] && errors.indexOf(password) === -1) { 
            errors.push([password, "Password cannot be empty"]) 
        };

        return errors; 
    }
};

exports.signin = function(req, res, next) {
    //User has already had their email and password auth'd
    //We just need to give them a token
    res.send({ token: tokenForUser(req.user)})
}

