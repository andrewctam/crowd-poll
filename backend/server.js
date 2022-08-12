//comment out below when committing to heroku git
require('dotenv').config()

const express = require('express');
const connectMongoDB = require("./database");
const cors = require('cors');

const app = express()

connectMongoDB();

app.use(cors());

const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };


app.use(express.json());
app.use(express.urlencoded({extended:false}))

app.use("/api/polls", require("./routes/pollRoutes"))
app.use("/api/users", require("./routes/userRoutes"))

const port = process.env.PORT || 6000
app.listen(port, () => {console.log(`Server started on port ${port}`)})



  