const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');

router.get('/search/:searchTerm', async (req, res) => {
    const searchTerm = req.params.searchTerm;
    const tags = await Tag.find({ name: { $regex: searchTerm, $options: 'i' } });
    res.json(tags);
});

router.post('/', async (req, res) => {
    const tagName = req.body.name;
    const newTag = new Tag({ name: tagName });
    await newTag.save();
    res.json(newTag);
});

module.exports = router;