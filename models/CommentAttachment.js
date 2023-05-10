const mongoose = require('mongoose');

const CommentAttachmentSchema = new mongoose.Schema({
    blobName: { type: String, required: true },
    uri: { type: String, required: true },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }
}, {timestamps: true});

module.exports = mongoose.model('CommentAttachment', CommentAttachmentSchema);
