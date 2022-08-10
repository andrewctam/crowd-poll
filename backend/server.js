require('dotenv').config()

const express = require('express');
const app = express()

const connectMongoDB = require("./database");
connectMongoDB();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use("/api/polls", require("./routes/pollRoutes"))


const port = 5001
app.listen(port, () => {console.log(`Server started on port ${port}`)})
