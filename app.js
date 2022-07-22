require('dotenv').config()
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session')
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const { Schema, model } = mongoose;



const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
  // cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("");

const userSchema = new Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const userdata = model("User", userSchema);

passport.use(userdata.createStrategy());

// use static serialize and deserialize of model for passport session support
// passport.serializeUser(userdata.serializeUser());
// passport.deserializeUser(userdata.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});



app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()){
    res.render("secrets")
  }
  else {
    res.redirect("/login")
  }
})

app.post('/logout', function(req, res){
  req.logout(function(err) {
    if (err){ console.log(err); }
    else{
    res.clearCookie('connect.sid');
    res.redirect('/');
  }
  });
});


app.post("/register", (req, res) => {
  userdata.register({ username: req.body.username },req.body.password, (err, data) => {
    if (err) {
      console.log(err);
      res.redirect("/register")
    }
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })
});

app.post("/login", (req, res) => {
  const user = new userdata({
    email:req.body.username,
    password:req.body.password
  });

  req.login(user, function(err) {
    if (err) { console.log(err); }
    else res.redirect("/secrets");
  });


});

app.listen(3000, function () {
  console.log("listning to port 3000");
});
