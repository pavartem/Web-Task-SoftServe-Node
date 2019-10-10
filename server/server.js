const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017/webtask';
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const appealsRouter = require('./routes/appeals');
const newsRouter = require('./routes/news');

app.use('/appeals', appealsRouter);
app.use('/news', newsRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
