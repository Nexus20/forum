const mongoose = require('mongoose');

const PostAttachmentSchema = new mongoose.Schema({
    blobName: { type: String, required: true },
    uri: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
}, {timestamps: true});

module.exports = mongoose.model('PostAttachment', PostAttachmentSchema);
