const express = require("express");
const path = require("path");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors  = require("../middleware/catchAsyncErrors")
const { upload } = require("../multer");
const User = require("../model/User");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/emailSend");
const sendToken = require("../utils/jwtToken")
const { isAuthenticated } = require("../middleware/auth")

/**
 * @description Create user Acount
 * @access Public
 * @api /api/v2/user/create-user
 * @type POST
 */
router.post("/create-user", upload.single("file"), async (req, res) => {
    try {

        const { name, email, password } = req.body;
        const userEmail = await User.findOne({ email });

        if (userEmail) {
            const filename = req.file.filename;
            const filePath = `uploads/${filename}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log(err);
               return res.status(500).json({ message: "Error deleting file" });
              }
            });
            return res.status(400).json({
                success: false,
                message: "Email is alredy exits"
            })
        }

        const filename = req.file.filename;
        const fileUrl = path.join(filename)

        const user = {
            name: name,
            email: email,
            password: password,
            avatar: fileUrl
        };

        const activationToken = createActivationToken(user);

        const activationUrl = `http://localhost:3000/activation/${activationToken}`;

        console.log(activationUrl)
        console.log(user.email)

        let html = `
        <h1>Hello, ${user.name}</h1>
        <p>Please click the following link to verify your account ${activationUrl}</p>
    `;
    try{
        await sendMail(user.email, "Verify Account", "Please verify Your Account", html);
        return res.status(201).json({
            success: true,
            message: "Your account is create please verify your email address."
        })

    }catch(error){
        console.log(error)
    }

    } catch (error) {
        console.log(error)
    }
});

// create activation taken
const createActivationToken = (user) => {
    return jwt.sign(user, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    })
}

// activate user
router.post("/activation", catchAsyncErrors(async(req, res, next) => {
    try{
        const { activation_token } = req.body;

        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

        if(!newUser){
            return res.status(400).json({
                success: false,
                message: "Invalid Token"
            })
        }

        const { name, email, password, avatar} = newUser;

        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({
                message: "User already exists",
            })
        }

        user = await User.create({
            name,
            email,
            avatar,
            password,
        })
        sendToken(user, 201, res);


    }catch(error){
        console.log(error)
       return res.status(500).json({
        success: false,
        message: "Internal Error"
       })

    }
}))


// login User
router.post("/login", catchAsyncErrors(async(req, res, next) =>{
    try{

        const  { email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Please provide all the fields!"
            })
        }

        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }
    
        const isPasswordValid = await user.comparePassword(password);

        if(!isPasswordValid){
            return res.status(400).json({
                message: "Please Provide the Correct Information"
            })
        }

        sendToken(user, 201, res);
    }catch(error){
        console.log(error)
        return res.status(400).json({
            message: "Username and Password are Incorrect"
            
        })
    }
}))


// get users from database
router.get("/getuser", isAuthenticated, catchAsyncErrors(async(req, res, next) => {
    try{

       
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User doesn't exists"
            })
        }

        return res.status(200).json({
            success: true,
            user,
        })

    }catch(error){
        console.log(error)
        return res.status(400).json({
            message: "No you data"
        })
    }
}))

module.exports = router;



