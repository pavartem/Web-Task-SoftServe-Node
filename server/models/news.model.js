const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const newsSchema = new Schema({
    image: {type: String},
    text: {type: String, required: true},
    title: {type: String, required: true},
});

const News = mongoose.model('News', newsSchema);

module.exports = News;