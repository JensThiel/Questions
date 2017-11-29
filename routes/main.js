"use strict";

const router = require("express").Router();
const Thread = require("../models/thread");
const User = require("../models/user");
const Spammer = require("../mail");

/**
 * TODO implement pagination
 * more info @
 * http://madhums.me/2012/08/20/pagination-using-mongoose-express-and-jade/
 * https://stackoverflow.com/questions/5539955/how-to-paginate-with-mongoose-in-node-js
 */

router
/**
 * Default Route
 */
    .get("/", function (req, res) {
        Thread.find({}).populate({
            path: "answers",
            populate: {
                path: "comments author",
                populate: {
                    path: "author",
                },
            }
        }).sort("-creationDate").then(threads => {
            res.render("index", {
                title: "Home - Questions",
                user: req.user,
                threads: threads,

            });


        }).catch(err => {
            res.render('error', {
                title: err,
                errorMsg: "Unable to load threads."
            })
        });
    })

    .get('/leaderboard',function(req,res){
        User.find({}).sort("-credits").select('alias credits  badge').exec().then(users=>{
            console.log(users);
            res.render("leaderboard",{
                title:'Leaderboard - Questions',
                user: req.user,
                users:users
    
            });
        })
    })
    .get("/thread/:id", function (req, res, next) {
        Thread.findOne({_id: req.params.id}).populate({
            path: "answers",
            populate: {
                path: "comments author",
                populate: {
                    path: "author",
                },
            }
        }).then(thread => {
            console.log(thread);
            res.render("threadDetail",{
                title:'Thread',
                user: req.user,
                thread: thread
            });
        }).catch(err => next(err));
    })
    .get('/subscriptions',function(req,res){
        User.findById(req.user.uid).then(user=>{
            res.render("subscriptions",{
                title:req.user.alias+ " - Subscriptions",
                user:user})
        })
    })
    .post('/subscribe',function(req,res){
        User.findById(req.user.uid).then(user=>{
            user.newSub(req.body.sub);
            res.redirect('/subscriptions');
            Spammer.transporter.sendMail();
        })
    })
    .get('/removesub/:sub',function(req,res){
        User.findById(req.user.uid).then(user=>{
            user.removeSub(req.params.sub);
            res.redirect('/subscriptions');
        })
    })

    /**
     * logout
     */
    .get('/logout', function (req, res) {
        req.logout();
        req.session = null; //Remove session from sessionStore
        res.redirect('/');
    })
    .get('/gettags', function (req, res) {
        Thread.distinct('tags', function (error, tags) {
            res.send(tags);
        });

    })
    .get('/newClass/:tag', function (req, res) {
        res.render("class", {
            title: req.params.tag
        });
    })
    .get('/getcredits',function(req,res){

        User.findById(req.user.uid,function(err,user){
            res.json(user.credits);
        });
})
    .post('/edit-alias',function(req,res){
        User.findById(req.user.uid,function(err,foundUser){
            req.user.alias=req.body.new_name;
            foundUser.alias = req.body.new_name;
            foundUser.save();
            res.send('relog for username change to take effect');
        });
    });

module.exports = router;