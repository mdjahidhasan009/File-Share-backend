"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cloudinary_1 = require("cloudinary");
const db_1 = __importDefault(require("./config/db"));
const files_1 = __importDefault(require("./route/files"));
const app = (0, express_1.default)();
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
(0, db_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use('/api/files', files_1.default);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is listen on PORT ${PORT}`);
});
