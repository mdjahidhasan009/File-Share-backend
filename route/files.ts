import express from 'express';
import multer from 'multer';
import  { v2 as cloudinary, UploadApiResponse} from 'cloudinary';
import https from 'https';
// import nodemailer from 'nodemailer';
let nodemailer = require('nodemailer');

import File from '../models/File';
import createEmailTemplate from "../utils/createEmailTemplate";

const router = express.Router();
const storage = multer.diskStorage({});
let upload = multer({
  storage
})

router.post("/upload", upload.single("myFile"), async (req, res) => {
  try {
    if(!req.file) {
      return res.status(400).json({ message: "File not sent form frontend!"});
    }
    let uploadFile: UploadApiResponse;
    try {
      console.log(req.file.path)
      uploadFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploadedFiles",
        resource_type: "auto"
      });

      const { originalname } = req.file;
      const { secure_url, bytes, format } = uploadFile;

      const file = await File.create({
        fileName: originalname,
        sizeInBytes: bytes,
        secure_url,
        format
      });

      return res.status(200).json({
        id: file._id,
        downloadPageLink: `${process.env.API_BASE_ENDPOINT_CLIENT}download/${file._id}`,
      });

    } catch (e) {
      console.log((e as Error).message);
      return res.status(400).json({ message: "Cloudinary Error!" });
    }
  } catch (e) {
  // } catch (e) {
    console.log((e as Error).message);
    return res.status(500).json({ message: "Server Error" });
  }

})

router.get('/:id', async(req,res) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);
    if(!file) {
      return res.status(404).json({ message: "File does not exits."});
    }

    const { fileName, format, sizeInBytes } = file;
    return res.status(200).json({
      name: fileName,
      format,
      sizeInBytes,
      id
    })
  } catch (e) {
    return res.status(500).json({ message: "Server Error "});
  }
})

router.get('/:id/download', async(req,res) => {
  try {
    const id = req.params.id;
    const file = await File.findById(id);
    if(!file) {
      return res.status(404).json({ message: "File does not exits."});
    }

    https.get(file.secure_url, (fileStream) => fileStream.pipe(res));
  } catch (e) {
    return res.status(500).json({ message: "Server Error "});
  }
})

router.post('/email', async (req, res) => {
  const { id, emailFrom, emailTo } = req.body;
  const file = await File.findById(id);
  if(!file) {
    return res.status(404).json({ message: "File does not exits"});
  }
  //Creating transporter
  let transporter = nodemailer.createTransport({
    host: process.env.SENDINBLUE_SMTP_HOST!,
    port: process.env.SENDINBLUE_SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SENDINBLUE_SMTP_USER,
      pass: process.env.SENDINBLUE_SMTP_MASTER_PASS
    }
  });
  //preparing email
  const { fileName, sizeInBytes } = file;
  const fileSize = `${((Number(sizeInBytes) / (1024 * 1024)).toFixed(2))} MB`;
  const downloadPageLink = `${process.env.API_BASE_ENDPOINT_CLIENT}download/${file._id}`;

  const mailOptions = {
    from: emailFrom,
    to: emailTo,
    subject: "Get the shared file",
    text: `${emailFrom} shared a file with you`,
    html: createEmailTemplate(emailFrom, downloadPageLink, fileName, fileSize)
  };

  //TODO: will change error and info type
  transporter.sendMail(mailOptions, async(error:any, info:any) => {
    if(error) {
      console.log(error);
      return res.status(500).json({
        message: "Server Error",
      });
    }

    file.sender = emailFrom;
    file.receiver = emailTo;

    await file.save();
    return res.status(200).json({
      message: "Email Sent"
    })
  })
})

export default router;
