import mongoose from 'mongoose';
const URI = process.env.MONGO_URI

mongoose.connect(`${URI}`).then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
})