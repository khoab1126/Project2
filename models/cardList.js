// require mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
  name: String,
  cardVarity: String,
  cardAtt: Number,
  cardDef: Number,
  cardEffect: String
});

// const Client = mongoose.model('Client', ClientSchema);
// module.exports = Client;
module.exports = mongoose.model('Client', ClientSchema);