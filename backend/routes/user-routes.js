var express = require('express');
var router = express.Router();
var User   = require('../models/user'); // get our mongoose model
var encryption = require ('../Helpers/encryption');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config');
var logger = require('../Helpers/logger')('User routes');
var adminRoutes = require('./admin-routes');

router.post('/register', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    if (!email || !password || !name) {
        res.json({success: false, message: 'Email, password, or name not provided'});
    } else {
        User.findOne({email: email}).then((user) => {
            if(user) {
                return res.json({success: false, message: 'Email exists'});
            }
            password = encryption.encryptPassword(password);
            if (!password) {
                return res.json({success: false, message: 'Was not able to encrypt Password'});
            }
            var user = new User({
                name: name,
                email: email,
                password: password,
                admin: false
            });
            user.save((err) => {
                if(err) {
                    logger.info('Was not able to register user: ' + err);
                    return res.json({success: false, message: 'Error with registration process, please try again'});
                }
                const payLoad = {
                    email: email
                }
                var token = jwt.sign(payLoad, config.secret, { //@TODO: Change this to a private key, that is stored on the computer securely.
                    expiresIn: "30 days" //30 days
                });
                res.json({success: true, message: 'Registered Successfully', token: token});
            });
        });
    
    }
});

//{'email': '', 'password': ''}
router.post('/authenticate', (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (err) {
            throw err;
        }
        if(!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else {
            if (encryption.comparePassword(user.password, req.body.password)) {
                const payLoad = {
                    email: req.body.email
                }
                var token = jwt.sign(payLoad, config.secret, { //@TODO: Change this to a private key, that is stored on the computer securely.
                    expiresIn: "30 days" //30 days
                });
                res.json({success: true, message:'Received Token', token:token, admin:user.admin});
            } else {
                res.json({ success: false, message: 'Authentication failed. Password did not match.' });
            }
        }
    });
});

// route middleware to verify a token, everything below this uses the middleware
router.use((req, res, next) => {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
    // decode token
    if (token) {
  
      // verifies secret and checks exp
      jwt.verify(token, config.secret, (err, decoded) => {      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes. Contains email property.
          //https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
          res.locals.userInfo = decoded;    
          next();
        }
      });
  
    } else {
  
      // if there is no token
      // return an error
      return res.status(403).send({ 
          success: false, 
          message: 'No token provided.' 
      });
  
    }
  });


/*
Regular User Routes

*/

//Router only to update email, name, and password
router.put('/update', (req, res) => {
    const doc ={};
    if (req.body.name) doc.name = req.body.name;
    if (req.body.email) doc.email = req.body.email;
    if (req.body.password) doc.password = encryption.encryptPassword(req.body.password);
    let email = res.locals.userInfo.email;
    User.findOneAndUpdate({email: email}, {$set: doc}, (err) => {
        if(err) {
            logger.info('Error updating user info: ' + err);
            return res.json({success: false, message: 'Error with updating user info. Please try again.'});
        }
        res.json({success: true, message: 'Updated Successfully'});
    });
    
});


// In order to submit a users GitURL + submitted time. We use submitted time to see if a user finished it quicker than imagined. This also allows them
// to submit multiple times
router.post('/submit', (req, res) => {
    let giturl = req.body.giturl;
    let submittedTime = new Date();
    let email = res.locals.userInfo.email;
    let doc = {
        submittedTime: submittedTime
    };
    if(giturl) doc.giturl = giturl;
    User.findOne({email: email}, (err, user) => {
        if (err) {
            logger.info('Was not able to find user during submittal: ' + err);
            return res.json({success: false, message: 'Error finding user'});
        }
        if (user.endtime > submittedTime) { //If trying to submit after it has already ended
            return res.json({success: false, message: 'Your time has elapsed'});
        }
        user.submittedTime = submittedTime;
        user.giturl = giturl;
        user.save((err) => {
            if(err) {
                logger.warn('Error saving to user: ' + err);
                return res.json({success: false, message: 'Error updating user'});
            } else {
                res.json({success: true, message: 'Successfully Updated'});
            }
             
        });
    });
});


//Send user an interview, with interview ID. On Client-Side see if you have a token, if not send to registration page, and then transfer back.
//Once authenticated, and after the registration process, it will automatically start the timer, and end time. Make sure to handle cases when
//user has already started time, and if user's given time has ended.

router.get('/interview:interviewId', (req, res) => {
    if(!req.params.interviewId) {
        return res.json({success: false, message: 'Interview ID was not passed'});
    }
    Interview.findById(req.params.interviewId, (err, interview) => {
        if(err) {
            logger.info('Was not able to find interview: ' + err);
            return res.json({success: false, message: 'Error with finding interview'});
        }
        User.findOne({email: res.locals.userInfo.email}, (err, user) => {
            if(err) {
                logger.info('Was not able to find user during interview: ' + err);
                return res.json({success: false, message: 'Error finding user from token'});
            }
            var starttime = new Date();
            var endtime = new Date();
            //Add an extra half minute to give a bit of leeway.
            endtime.setMinutes(starttime.getMinutes() + interview.duration + .5);
            if (user.endtime > starttime) { // if user has already ended, then ensure they can't resubmit.
                return res.json({success: false, message: 'Interview time has been completed'});
            }
            var doc = {
                starttime: starttime,
                endtime: endtime
            };
            if (!user.starttime) { // Only if the user has not already started, should we start them, and put an end point for them.

                User.updateOne({_id: user._id}, {$set: doc}, (err, _) => {
                    if(err) {
                        logger.info('Was not able to update user with new start, and end times: ' + err);
                        return res.json({success: false, message: 'Error updating user'});
                    }
                });
            } else { // User has started already
                doc.starttime = user.starttime;
                doc.endtime = user.endtime;
            }
            var durationdiffMs = doc.endtime - doc.starttime; //Duration Difference in Milliseconds
            var diffMins = Math.round(((durationdiffMs % 86400000) % 3600000) / 60000); // minutes
            let returnUser = { //Return back duration, so client side only needs to take care of timer, and nothing else. 
                duration: diffMins,
                githubUrl: user.giturl
            };
            res.json({success: true, interview: interview, user: returnUser});
        });
    });
});





  //api/admin -> get sent to here
  router.use('/admin', adminRoutes);




module.exports = router;