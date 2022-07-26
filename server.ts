import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { v2 as cloudinary } from 'cloudinary';

import connectDB from './config/db';
import fileRoute from './route/files';

const app = express();

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded(
  {
    extended: true,
  })
);
app.use('/api/files', fileRoute);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is listen on PORT ${PORT}`);
});
