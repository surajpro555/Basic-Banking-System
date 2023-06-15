//=====================================Backend-Part================================//
const express = require("express");
const app = express();
//hadle data from form
const bodyParser = require("body-parser");
//for connecting to database
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
//for capitalize user name after singup
const _ = require("lodash");
const dotenv=require('dotenv').config()

//for checking the form is submitted
let result = false;
let exits = false;
let lowamount = false;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//connecting database with database
(async function() {
  try {
    await mongoose.connect(process.env.MongoURL);
    console.log("Connected to database");
  } catch (err) {
    console.error(err);
  }
})();


//schema for user
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number,
});

//make model of user
const User = mongoose.model("User", userSchema);

//creating dummy data for Users
const user1 = new User({
  name: "Suraj Prajapati",
  email: "suraj111prajapati@gmail.com",
  balance: 10000,
});

const user2 = new User({
  name: "Vivek Tiwari",
  email: "vivek222tiwari@gmail.com",
  balance: 10000,
});

const user3 = new User({
  name: "Sagar Singh",
  email: "sagar333singh@gmail.com",
  balance: 10000,
});

const user4 = new User({
  name: "Abhi Upadhyay",
  email: "abhi444Upadhyay@gmail.com",
  balance: 10000,
});

const user5 = new User({
  name: "Sai Kaushik",
  email: "Sai555Kaushik@gmail.com",
  balance: 10000
});

const user6 = new User({
  name: "Jagjeet Singh",
  email: "Jagjeet666Singh@gmail.com",
  balance: 10000,
});

const user7 = new User({
  name: "UjwaL RajPurohit",
  email: "UjwaL777RajPurohit@gmail.com",
  balance: 10000,
});

const user8 = new User({
  name: "Harsh Tiwari",
  email: "Harsh888Tiwari@gmail.com",
  balance: 10000,
});

const user9 = new User({
  name: "Umesh",
  email: "umesh999@gmail.com",
  balance: 10000,
});

const user10 = new User({
  name: "Anand Tiwari",
  email: "Anand101010Tiwari@gmail.com",
  balance: 10000,
});

//made array of users 
const userData = [
  user1,
  user2,
  user3,
  user4,
  user5,
  user6,
  user7,
  user8,
  user9,
  user10,
];

//if user collection is empty,then insert dummy data
User.find()
  .then((foundItems) => {
    if (foundItems.length == 0) {
      User.insertMany(userData)
        .then(() => console.log("inserted dummy data in User collection"))
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.error(err));

//transaction schema
const transactionSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  amount: Number,
  date: String,
});
//make model of transaction
const Transaction = mongoose.model("Transaction", transactionSchema);
//dummy data for transaction
const t1 = new Transaction({
  sender: "Vivek Tiwari",
  receiver: "Suraj Prajapati",
  amount: 1000,
  date: date.getDate(),
});

const transactionData = [t1];
//if transaction collection is empty,insert dummy transactions
Transaction.find()
  .then((foundItems) => {
    if (foundItems.length == 0) {
      Transaction.insertMany(transactionData)
        .then(() =>
          console.log("inserted dummy data in Transaction collection")
        )
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.error(err));


//home page render
app.get("/", function (req, res) {
  res.render("home");
});

//customerlist page render,with customer name
app.get("/customerlist", function (req, res) {
  User.find()
    .then((foundUsers) => {
      //if new user register then this work
      if (result === true) {
        result = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "welcome to VizBank",
        });
      }
      // if user already present ,then directly goes to customerlist page with message
      
       else if (exits === true) {
        exits = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "user already exist!",
        });
      } else if (lowamount === true) {
        lowamount = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "Not present required money",
        });
      } else {
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: null,
        });
      }
    })
    .catch((err) => console.error(err));
});

//render transaction page
app.get("/transaction", function (req, res) {
  Transaction.find()
    .then((foundTransaction) => {
      res.render("transaction", { transactions: foundTransaction, i: 1 });
    })
    .catch((err) => console.error(err));
});
//render contact page
app.get("/contact", function (req, res) {
  res.render("contact");
});




//render to payment form
app.get("/payment", function (req, res) {
  User.find()
  .then((foundUsers) => {
    //if new user register then this work
    if (result === true) {
      result = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "welcome to VizBank",
      });
    }
    // if user already present ,then directly goes to customerlist page with message
    
     else if (exits === true) {
      exits = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "user already exist!",
      });
    } else if (lowamount === true) {
      lowamount = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "Not present required money",
      });
    } else {
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: null,
      });
    }
  })
  .catch((err) => console.error(err));
});

app.post("/customerlist", async function (req, res) {
  try {
    const amount = parseInt(req.body.amount);

    // Finding sender data
    const foundSender = await User.findOne({ name: req.body.sender });
    if (!foundSender || foundSender.balance <= amount) {
      console.log("Sender not found or balance insufficient");
      lowamount = true;
      res.redirect("/customerlist");
      return;
    }

    // Finding receiver data
    const foundReceiver = await User.findOne({ name: req.body.receiver });
    if (!foundReceiver) {
      console.log("Receiver not found");
      res.redirect("/customerlist");
      return;
    }

    // Create new transaction
    const transaction = new Transaction({
      sender: req.body.sender,
      receiver: req.body.receiver,
      amount: amount,
      date: date.getDate(),
    });
    await transaction.save();
    console.log("Transaction successful");

    // Update sender balance
    const senderBalance = foundSender.balance - amount;
    await User.updateOne(
      { name: req.body.sender },
      { $set: { balance: senderBalance } }
    );

    // Update receiver balance
    const receiverBalance = foundReceiver.balance + amount;
    await User.updateOne(
      { name: req.body.receiver },
      { $set: { balance: receiverBalance } }
    );

    console.log(`Sender balance updated to ${senderBalance}`);
    console.log(`Receiver balance updated to ${receiverBalance}`);
    res.redirect("/customerlist");
  } catch (err) {
    console.error(err);
    res.redirect("/customerlist");
  }
});

//check for server is listen or not
app.listen(3000 || process.env.PORT, function () {
  console.log("server started at port 3000");
});
