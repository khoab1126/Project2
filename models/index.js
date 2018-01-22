// require mongoose
var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/hsCardGenerator");

var CardList = require('./cardList');

module.exports.Client = CardList;