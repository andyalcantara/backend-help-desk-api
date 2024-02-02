const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  name: {type: Schema.Types.String, required: true},
  email: { type: Schema.Types.String, required: true},
  description: { type: Schema.Types.String, required: true},
  file: { type: Schema.Types.String, required: true},
  ticketStatus: {type: Schema.Types.String },
  comments: [{type: Schema.Types.String}]
});

module.exports = mongoose.model('Ticket', ticketSchema);