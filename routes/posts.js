const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Tag = require('../models/Tag');
const PostAttachment = require('../models/PostAttachment');
const CommentAttachment = require('../models/CommentAttachment');
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const {upload, blobServiceClient} = require("../config/storage");

const containerClient = blobServiceClient.getContainerClient('attachments');

router.get('/new', ensureAuthenticated, function (req, res, next) {
    res.render('create_post', {title: 'Express'});
});

router.put('/:postId/comments/:commentId', async (req, res) => {
    const newContent = req.body.text;
    await Comment.findByIdAndUpdate(req.params.commentId, { content: newContent });
    res.sendStatus(204);
});

router.delete('/:postId/comments/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;

        // Найти вложения, связанные с комментарием
        const attachments = await CommentAttachment.find({ comment: commentId });

        // Удалить вложения из облака
        for (const attachment of attachments) {
            const blobClient = containerClient.getBlobClient(attachment.blobName);
            await blobClient.deleteIfExists();
        }

        // Удалить вложения из базы данных
        await CommentAttachment.deleteMany({ comment: commentId });


        await Comment.findByIdAndDelete(commentId);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/:postId/comments', upload.array('images', 5), ensureAuthenticated, async (req, res) => {
    const postId = req.params.postId;
    const authorId = req.user.userId;
    const content = req.body.content;

    try {
        // Создание нового комментария
        const newComment = new Comment({
            content,
            author: authorId,
            post: postId,
            createdAt: new Date()
        });
        await newComment.save();

        // Добавление комментария к посту
        const post = await Post.findById(postId);
        post.comments.push(newComment._id);
        await post.save();

        const commentAttachments = req.files.map(file => ({
            blobName: file.blobName,
            uri: file.url,
            comment: newComment._id
        }));

        await CommentAttachment.insertMany(commentAttachments);

        const createdComment = await Comment.findById(newComment._id);
        const fileNames = commentAttachments.map(x => x.blobName);
        const createdAttachments = await CommentAttachment.find({blobName: {$in: fileNames}}).exec();
        const attachmentsIds = createdAttachments.map(x => x._id);
        createdComment.attachments = createdComment.attachments.concat(attachmentsIds);
        await createdComment.save();

        // Перенаправление на страницу поста
        res.redirect(`/posts/${postId}`);
    } catch (err) {
        console.error(err);
        res.redirect('/errors/500');
    }
});

router.post('/new', ensureAuthenticated, upload.array('images', 5), async function(req, res, next) {
    // Получить данные из формы
    const title = req.body.title;
    const content = req.body.content;
    const tags = req.body.tags.split(','); // предполагается, что теги передаются в виде строки, разделенной запятыми

    // Проверить данные на валидность (это простой пример, вы можете добавить более сложные проверки)
    if (!title || !content) {
        res.render('create-post', { error: 'Title and content are required' });
        return;
    }

    // Создать новый объект поста с полученными данными
    const newPost = new Post({
        title: title,
        content: content,
        tags: tags,
        author: req.user.userId, // добавьте это поле в модель Post, если оно еще не добавлено
    });

    // Сохранить новый объект поста в базе данных
    try {
        await newPost.save();

        const postAttachments = req.files.map(file => ({
            blobName: file.blobName,
            uri: file.url,
            post: newPost._id
        }));

        await PostAttachment.insertMany(postAttachments);

        const createdPost = await Post.findById(newPost._id);
        const fileNames = postAttachments.map(x => x.blobName);
        const createdAttachments = await PostAttachment.find({blobName: {$in: fileNames}}).exec();
        const attachmentsIds = createdAttachments.map(x => x._id);
        createdPost.attachments = createdPost.attachments.concat(attachmentsIds);
        await createdPost.save();

        // Перенаправить пользователя на страницу с созданным постом или на другую страницу, если процесс создания был успешным
        res.redirect(`/posts/${newPost._id}`);
    } catch (error) {
        console.error(error);
        res.render('create_post', { error: 'Error creating post' });
    }
})

router.get('/:postId', ensureAuthenticated, async function(req, res, next) {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId)
            .populate('tags')
            .populate('author')
            .populate('attachments')
            .populate({
                path: 'comments', populate: [
                    {path: 'author'},
                    {path: 'attachments'}
                ]
            })
            .exec(); // используйте .populate('tags'), если у вас есть отношение с коллекцией тегов

        if (!post) {
            res.status(404).render('error', { message: 'Post not found' });
            return;
        }

        res.render('post', { post: post });
    } catch (error) {
        console.error(error);
        res.redirect('/errors/500');
    }
});

router.get('/', ensureAuthenticated, async function(req, res, next) {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const titleSearch = req.query.title || '';
        const tagSearch = req.query.tag || '';

        const query = { title: { $regex: titleSearch, $options: 'i' } };
        if (tagSearch) {
            const tagsByNames = await Tag.find({name: {$in: tagSearch.split(',')}})

            if(tagsByNames) {
                const tagsIds = tagsByNames.map(x => x._id);
                query.tags = { $in: tagsIds };
            }
        }

        const posts = await Post.find(query)
            .populate('tags')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const totalPosts = await Post.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        res.render('posts', {
            posts: posts,
            page: page,
            totalPages: totalPages,
            titleSearch: titleSearch,
            tagSearch: tagSearch,
            limit: limit
        });

    } catch (error) {
        console.error(error);
        res.redirect('/errors/500');
    }
});

module.exports = router;
