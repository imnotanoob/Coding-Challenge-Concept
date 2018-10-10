
var express = require('express');
var router = express.Router({mergeParams: true});
var Interview = require('../models/interview');
var logger = require('../Helpers/logger')('Admin Routes');
var User = require('../models/user');
//Router to check if user is an admin
router.use((req, res, next) => {
    let email = res.locals.userInfo.email;
    console.log(email);
    User.findOne({email: email}, (err, user) => {
        if (err) {
            return res.json({success: false, message: 'Nonexistant email'});
        }
        if(user.admin) {
            next();
        } else {
            return res.json({success: false, message: 'Unauthorized access: needs to be an admin'});
        }
    });
});


/*

Admin routes. Only users that have admin permissions can access this.

*/

router.post('/interview', (req, res) => {
    let email = res.locals.userInfo.email;
    let name = req.body.name;
    let body = req.body.body;
    let type = req.body.type;
    let duration = req.body.duration;
    if (!name || !body || !type || !duration) {
        return res.json({success: false, message: 'Name, body, or type not provided'});
    }
    User.findOne({email: email}, (err, user) => {
        if (err) {
            return res.json({success: false, message: 'Nonexistant email'});
        }
        let userId = user._id;
        var doc = new Interview({
            name: name,
            body: body,
            type: type,
            createdBy: userId,
            duration: duration
        });
        doc.save((err) => {
            if(err) {
                logger.info('Was not able to register interview: ' + err);
                return res.json({success: false, message: 'Error with registering interview process, please try again'});
            }
            res.json({success: true, message: 'Registered Successfully'});
        });
    });
});

//Gets all Interviews
router.get('/interview', (_, res) => {
    Interview.find({}, (err, interviews) => {
        if(err) {
            logger.info('Was not able to find interviews: ' + err);
            return res.json({success: false, message: 'Error with finding interview questions'});
        }
        res.json({success: true, interviews: interviews});
    });
});

//Update Interview, pass /interview/:interviewId
router.put('/interview/:interviewId', (req, res) => {
    if(!req.params.interviewId) {
        return res.json({success: false, message: 'Interview ID was not passed'});
    }
    let doc = {};

    let email = res.locals.userInfo.email;
    User.findOne({email: email}, (err, user) => {
        if (err) {
            return res.json({success: false, message: 'Nonexistant email'});
        }
        if(req.body.name) doc.name = req.body.name;
        if(req.body.body) doc.body = req.body.body;
        if(req.body.type) doc.type = req.body.type;
        if(req.body.duration) doc.duration = req.body.duration;
        let userId = user._id;
        doc.updatedBy = userId;
          Interview.updateOne({_id: req.params.interviewId}, {$set: doc}, (err, _) => {
              if (err) {
                  logger.info('Was not able to update interview: ' + err);
                  return res.json({success: false, errorMessage: 'Error updating this interview. Please try again.'})
              }
              res.json({success: true, message: 'Updated Successfully'});
          });
    });
    
});

router.delete('/interview/:interviewId', (req, res) => {
    if(!req.params.interviewId) {
        return res.json({success: false, message: 'Interview ID was not passed'});
    }
    Interview.findOneAndDelete({_id: req.params.interviewId}, (err) => {
        if(err) {
            logger.info('Was not able to remove interview: ' + err);
            res.json({success: false, message: 'Error removing interview. Please try again'});
        } else {
            res.json({success: true, message: 'Removed: ' + req.params.interviewId});
        }
        
    })
});
// route to return all users (GET http://localhost:8080/api/users)
router.get('/users', function(req, res) {
    User.find({}, function(err, users) {
      res.json(users);
    });
  });

module.exports = router;