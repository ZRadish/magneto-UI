const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { exec } = require("child_process");
const AdmZip = require("adm-zip");
const { error, time } = require("console");

const app = express();
app.use(cors());

//Confugure storage for the zip file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    const extractDir = path.join(__dirname, "extracted");

    // Create the directories if they don't exist
    [uploadDir, extractDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    });

    cb(null, uploadDir);
  },
  fileName: (req, file, cb) => {
    //Use timestap to ensure unique filenames
    const timestamp = Date.now();
    cb(null, `input-${timestamp}.zip`);
  },
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLocaleLowerCase() === '.zip'){
            cb(null, true);
        } else{
            cb(error('Only .zip files are allowed'));
        }
    },
    limits:{
        fileSize: 1024 * 1024 * 50, //50MB limit
    }
 });

 app.post('/api/upload', upload.single('file'), async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).send('Please upload a file');
        }



        //check here 
        const fileInfo = {
            fileName: req.file.fileName,
            originalName: req.file.originalname,
            path: req.file.path,
            timestamp: Date.now(),
        };


        //work on this
        const fileLog = path.join(__dirname, 'uploads', fileInfo.fileName);


        //some code here



        res.status(200).json({
            message: 'File uploaded successfully',
            file: fileInfo,
        })

    }
