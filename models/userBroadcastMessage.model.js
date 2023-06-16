const constants = require('../config/constants');

const userBroadcastMessageSchema = new mongoose.Schema({
    _broadcastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'broadcastMessages'
    },
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    _contestId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    contestName: {
        type: String,
        default: null
    },
    contestType: {
        type: Number,
        default: null
    },
    rank:{
        type: Number,
    },
    prizeAmountEarned:{
        type: Number,
    },
    additionalGift: {
        type: Number,
        default: constants.ADDITIONAL_GIFT.NO
    },
    createdAt: {
        type: Number
    },
    updatedAt: {
        type: Number
    },
    syncAt: {
        type: Number
    },
    deletedAt: {
        type: Number,
        default: null
    }
});

userBroadcastMessageSchema.index({"_contestId": 1, "_userId" : 1});
userBroadcastMessageSchema.index({"_contestId": 1, "createdAt" : 1});

module.exports = mongoose.model('userBroadcastMessages', userBroadcastMessageSchema);
