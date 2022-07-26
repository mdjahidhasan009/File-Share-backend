import mongoose from 'mongoose';

const connectDB = async ():Promise<any> => {
  try{
    await mongoose.connect(process.env.MONGO_URL_REMOTE!);
  } catch (error:any) {
    console.log("Connection Error", error.message);
  }

  const connection = mongoose.connection;
  if(connection.readyState >= 1) {
    console.log("Connected to database");
    return;
  }
  connection.on("error", () => console.log("Connection failed"));
}

export default connectDB;
