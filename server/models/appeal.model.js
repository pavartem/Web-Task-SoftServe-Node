const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const appealSchema = new Schema({
    user: {type: String},
    text: {type: String},
    date: {type: String},
});

const Appeal = mongoose.model('Appeal', appealSchema);

module.exports = Appeal;