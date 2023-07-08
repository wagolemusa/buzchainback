const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, res, cb){
        cb(null, "uploads/");
    },
    filename: function (res, file, cb){
        const uniqueSuffix = Date.now() + "_" + Math.round.apply(Math.random() * 1e9);
        const filename = file.originalname.split(".")[0];
        cb(null, filename + "_" + uniqueSuffix + ".png")

    },
});

exports.upload = multer({storage: storage})

