const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PostAttachment' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
}, {timestamps: true});

module.exports = mongoose.model('Post', PostSchema);