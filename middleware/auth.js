const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors")
const jwt = require("jsonwebtoken")
const User = require("../model/User");

// exports.isAuthenticated = catchAsyncErrors(async(req, res, next) => {
//     // const {token} = req.cookies;
    
//     const token = req.headers.authorization.split(" ")[1];
//     console.log("token", token)

//     if(!token){
//         return res.status(400).json({
//             success: false,
//             message: "Please Login to continue"
//         })
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
//     console.log(decoded);
//     req.user = await User.findById(decoded.id);
//     console.log("me", req.user)

//     next();
// })



exports.isAuthenticated = catchAsyncErrors(async(req, res, next) => {
    if (req.headers.authorization) {
        
        const token = req.headers.authorization.split(" ")[1];

        console.log("token", token)

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded);

        req.user = await User.findById(decoded.id);
        console.log("me", req.user)
        next()
          
    } else {
      return res
        .status(401)
        .json({ message: "Not authorized, token not available" })
    }
  })



