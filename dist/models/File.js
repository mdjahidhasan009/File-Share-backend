"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const fileSchema = new Schema({
    fileName: {
        type: String,
        required: true
    },
    secure_url: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    sizeInBytes: {
        type: String,
        required: true
    },
    sender: {
        type: String,
    },
    receiver: {
        type: String,
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("File", fileSchema);
