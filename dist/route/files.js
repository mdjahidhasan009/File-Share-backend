"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const https_1 = __importDefault(require("https"));
// import nodemailer from 'nodemailer';
let nodemailer = require('nodemailer');
const File_1 = __importDefault(require("../models/File"));
const createEmailTemplate_1 = __importDefault(require("../utils/createEmailTemplate"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({});
let upload = (0, multer_1.default)({
    storage
});
router.post("/upload", upload.single("myFile"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File not sent form frontend!" });
        }
        let uploadFile;
        try {
            console.log(req.file.path);
            uploadFile = yield cloudinary_1.v2.uploader.upload(req.file.path, {
                folder: "uploadedFiles",
                resource_type: "auto"
            });
            const { originalname } = req.file;
            const { secure_url, bytes, format } = uploadFile;
            const file = yield File_1.default.create({
                fileName: originalname,
                sizeInBytes: bytes,
                secure_url,
                format
            });
            return res.status(200).json({
                id: file._id,
                downloadPageLink: `${process.env.API_BASE_ENDPOINT_CLIENT}download/${file._id}`,
            });
        }
        catch (e) {
            console.log(e.message);
            return res.status(400).json({ message: "Cloudinary Error!" });
        }
    }
    catch (e) {
        // } catch (e) {
        console.log(e.message);
        return res.status(500).json({ message: "Server Error" });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const file = yield File_1.default.findById(id);
        if (!file) {
            return res.status(404).json({ message: "File does not exits." });
        }
        const { fileName, format, sizeInBytes } = file;
        return res.status(200).json({
            name: fileName,
            format,
            sizeInBytes,
            id
        });
    }
    catch (e) {
        return res.status(500).json({ message: "Server Error " });
    }
}));
router.get('/:id/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const file = yield File_1.default.findById(id);
        if (!file) {
            return res.status(404).json({ message: "File does not exits." });
        }
        https_1.default.get(file.secure_url, (fileStream) => fileStream.pipe(res));
    }
    catch (e) {
        return res.status(500).json({ message: "Server Error " });
    }
}));
router.post('/email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, emailFrom, emailTo } = req.body;
    const file = yield File_1.default.findById(id);
    if (!file) {
        return res.status(404).json({ message: "File does not exits" });
    }
    //Creating transporter
    let transporter = nodemailer.createTransport({
        host: process.env.SENDINBLUE_SMTP_HOST,
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
        html: (0, createEmailTemplate_1.default)(emailFrom, downloadPageLink, fileName, fileSize)
    };
    //TODO: will change error and info type
    transporter.sendMail(mailOptions, (error, info) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.log(error);
            return res.status(500).json({
                message: "Server Error",
            });
        }
        file.sender = emailFrom;
        file.receiver = emailTo;
        yield file.save();
        return res.status(200).json({
            message: "Email Sent"
        });
    }));
}));
exports.default = router;
