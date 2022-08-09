const express = require('express');
const connectMongoDB = require("./database");
const app = express()
require('dotenv').config()

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded());

app.use("/api/polls", require("./routes/pollRoutes"))

connectMongoDB();

const port = 5001
app.listen(port, () => {console.log(`Server started on port ${port}`)})
