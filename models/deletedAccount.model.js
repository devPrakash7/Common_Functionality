const mongoose = require('mongoose');

const deletedAccountSchema = new mongoose.Schema({
  facebookId: {
    type: mongoose.Schema.Types.ObjectId
  },
  code: {
    type: String,
  },
  deletedAt: {
    type: Number,
    default: null,
  },
});

const DeletedAccount = mongoose.model('DeletedAccount', deletedAccountSchema);
module.exports = DeletedAccount;
