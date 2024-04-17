const express = require("express");
const { MongoClient } = require("mongodb");
const nodemailer = require("nodemailer");
const cors = require("cors");
var bcrypt = require('bcryptjs'); 
const app = express();
app.use(express.json());
app.listen(3000);
app.use(
  cors({
    origin: "https://ragunath-password-reset.netlify.app",
    // origin: "http://localhost:5173",
  })
);
const URL = process.env.DB;

//Generates a random String as OTP
function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

//This is the function which sends email
const sendmail = async(mailoptions)=>{
  const transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    auth:{
      user:process.env.email,
      pass:process.env.password
    }
  });

 try {
  await transporter.sendMail(mailoptions)
 } catch (error) {
  console.log(error)
 }
}


//Creates new user
app.post("/createuser", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("user_credentials");
    const collection = db.collection("users");
    await collection.insertOne(req.body);
    res.json("Success");
    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

//checks if user exists
app.get("/forgotpassword/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const connection = await MongoClient.connect(URL);
    const db = connection.db("user_credentials");
    const collection = db.collection("users");
    const user_exists = await collection.findOne({ email: email });
    if (user_exists) {
      res.json("User Exists");
    } else {
      res.json("User Not Exists");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

//inserts otp to users collection
app.put("/generateotp/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const connection = await MongoClient.connect(URL);
    const db = connection.db("user_credentials");
    const collection = db.collection("users");
    const otp = generateRandomString(5);
    const user_exists = await collection.updateOne(
      { email: email },
      { $set: { otp: otp } }
    );

    const mailoptions = {
      from:{
        name:'Ragunath',
        address:process.env.email
      },
      to:[email],
      subject:"Password Reset.",
      text:"otp",
      html: `<p>Click <a href="https://ragunath-password-reset.netlify.app/newpassword?email=${email}&otp=${otp}">here</a> to change your password.</p>`
    }
    await sendmail(mailoptions)
    res.json("otpsent");
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});

//gets the otp from user collection
app.get("/verifyotp/:email/:otp", async (req, res) => {
  try {
    const email = req.params.email;
    const entered_otp = req.params.otp;
    const connection = await MongoClient.connect(URL);
    const db = connection.db("user_credentials");
    const collection = db.collection("users");
    const user = await collection.findOne({ email: email });
    const otp = user.otp;
    if (entered_otp == otp) {
      res.json("verified");
      
    } else {
      res.json("not verified");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
  }
});
  
//updates the new password to the user 
app.put("/updatepassword/:email/:password",async(req,res)=>{
try {
const email = req.params.email;
var salt = bcrypt.genSaltSync(10);
var hased_password = bcrypt.hashSync(req.params.password, salt);
const connection = await MongoClient.connect(URL);
const db = connection.db("user_credentials");
const collection = db.collection("users");

const user = await collection.updateOne({ email: email },{$set:{password:hased_password}});
await collection.updateOne({ email: email },{$set:{otp:""}});
res.json("Password Updated Successfully")
} catch (error) {
    console.log(error);
    res.status(500).json("Something Went Wrong");
}
})
