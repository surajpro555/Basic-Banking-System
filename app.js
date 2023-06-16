/*--------------------------------------------------------------
                    Backend Library
--------------------------------------------------------------*/
const express = require("express");
const app=express();
const mongoose = require("mongoose");
const dotenv=require('dotenv').config();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/*--------------------------------------------------------------
                    DATABASE CONNECTION
--------------------------------------------------------------*/
const database_conn=async function() {
  try {
    await mongoose.connect(process.env.MongoURL);
    console.log("Connection successful");
  } catch (err) {
    console.error('ERROR OCCURED...........\n',err);
  }
};
database_conn();

/*--------------------------------------------------------------
                     SCHEMA
--------------------------------------------------------------*/
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  balance: Number,
});
const User = mongoose.model("User", userSchema);

/*--------------------------------------------------------------
                   10-DUMMY DATA
--------------------------------------------------------------*/
const userData = [
  {
    name: "Suraj Prajapati",
    email: "suraj111prajapati@gmail.com",
    balance: 10000,
  },
  {
    name: "Vivek Tiwari",
    email: "vivek222tiwari@gmail.com",
    balance: 10000,
  },
  {
    name: "Sagar Singh",
    email: "sagar333singh@gmail.com",
    balance: 10000,
  },
  {
    name: "Abhi Upadhyay",
    email: "abhi444Upadhyay@gmail.com",
    balance: 10000,
  },
  {
    name: "Sai Kaushik",
    email: "Sai555Kaushik@gmail.com",
    balance: 10000,
  },
  {
    name: "Jagjeet Singh",
    email: "Jagjeet666Singh@gmail.com",
    balance: 10000,
  },
  {
    name: "UjwaL RajPurohit",
    email: "UjwaL777RajPurohit@gmail.com",
    balance: 10000,
  },
  {
    name: "Harsh Tiwari",
    email: "Harsh888Tiwari@gmail.com",
    balance: 10000,
  },
  {
    name: "Umesh",
    email: "umesh999@gmail.com",
    balance: 10000,
  },
  {
    name: "Anand Tiwari",
    email: "Anand101010Tiwari@gmail.com",
    balance: 10000,
  },
];

User.find()
  .then((foundItems) => {
    if (foundItems.length == 0) {
      User.insertMany(userData)
        .then(() => console.log("inserted dummy data in User collection"))
        .catch((err) => console.error(err));
    }
  })
  .catch((err) => console.error(err));

const transactionSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  amount: Number,
  date: String,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

/*--------------------------------------------------------------
                    DATE FUNCTION
--------------------------------------------------------------*/
const getDate=function()
{
  let today=new Date();
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' ,hour:"numeric",minute:"numeric"};//for using time data ij js
  return today.toLocaleDateString("en-US",options);
}

/*--------------------------------------------------------------
                    RENDERING PAGES
--------------------------------------------------------------*/
let result = false,isavailable = false,lessamount= false;

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/customerlist", function (req, res) {
  User.find()
    .then((foundUsers) => {
      if (result === true) {
        result = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "Welcome to VizBank",
        });
      }
      else if (isavailable === true) {
        isavailable = false;
        res.render("customerlist", {
          customers: foundUsers,
          i: 1,
          message: "user already exist!",
        });
      } else if (lessamount=== true) {
        lessamount= false;
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


app.get("/transaction", function (req, res) {
  Transaction.find()
    .then((foundTransaction) => {
      res.render("transaction", { transactions: foundTransaction, i: 1 });
    })
    .catch((err) => console.error(err));
});


app.get("/about", function (req, res) {
  res.render("about");
});


app.get("/payment", function (req, res) {
  User.find()
  .then((foundUsers) => {
    if (result === true) {
      result = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "welcome to VizBank",
      });
    }
     else if (isavailable === true) {
      isavailable = false;
      res.render("payment", {
        customers: foundUsers,
        i: 1,
        message: "user already exist!",
      });
    } else if (lessamount=== true) {
      lessamount= false;
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


app.get("/failed", function (req, res) {
  const message = req.query.message || "Payment Failed";
  res.render("failed", { message: message });
});

app.get("/successful", function (req, res) {
  const message = req.query.message || "Payment successful";
  res.render("successful", { message: message });
});


app.post("/customerlist", async function (req, res) {
  try {
    const amount = parseInt(req.body.amount);
    const foundSender = await User.findOne({ name: req.body.sender });
    if (!foundSender || foundSender.balance <= amount) {
      const message = "Insufficient balance ";
      res.redirect(`/failed?message=${message}`);
      return;
    }

    const foundReceiver = await User.findOne({ name: req.body.receiver });
    if (!foundReceiver) {
      const message = "Invalid Receiver Name";
      res.redirect(`/failed?message=${message}`);
      return;
    }

    const transaction = new Transaction({
      sender: req.body.sender,
      receiver: req.body.receiver,
      amount: amount,
      date: getDate(),
    });
    await transaction.save();
    console.log("Transaction successful");

    const senderBalance = foundSender.balance - amount;
    await User.updateOne(
      { name: req.body.sender },
      { $set: { balance: senderBalance } }
    );

    const receiverBalance = foundReceiver.balance + amount;
    await User.updateOne(
      { name: req.body.receiver },
      { $set: { balance: receiverBalance } }
    );
    const sName=req.body.sender;
    const rName=req.body.receiver;
    const amt=req.body.amount
    const message =`${sName} have successfully transfered ${amt} to ${rName}`;
    res.redirect(`/successful?message=${message}`);
  } catch (err) {
    console.error(err);
    const message = "An error occurred";
    res.redirect(`/failed?message=${message}`);
  }
});

/*--------------------------------------------------------------
                     SERVER at PORT
--------------------------------------------------------------*/
app.listen(3000 || process.env.PORT, function () {
  console.log("server started at port 3000");
});