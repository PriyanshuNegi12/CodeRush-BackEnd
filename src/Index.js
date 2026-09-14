const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv/config');
const main = require('./config/DB');
const userRouter = require('./routes/userRouter');
const client = require('./config/Redis');
const problemRouter = require('./routes/problemRouter');
const submitRouter = require('./routes/submit');
const aiRouter = require("./routes/aiChatting")
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true 
}))


app.use(express.json());
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
    try {
        await client.ping();
        await mongoose.connection.db.admin().ping();
        res.status(200).send('OK');
    } catch (err) {
        res.status(200).send('OK - dependency check failed');
    }
});
app.use("/user", userRouter);
app.use("/problem", problemRouter);
app.use("/submission",submitRouter);
app.use('/ai',aiRouter);



async function initialConnection() {
    await Promise.all([main(),client.connect()]);
    console.log("connected to DB!!!!!");
    app.listen(process.env.PORT_NUMBER,()=>{
        console.log("Server Start Listening!!!!!!!!!");
    })
} 
initialConnection();