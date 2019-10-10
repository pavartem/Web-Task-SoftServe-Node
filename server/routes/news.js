const router = require('express').Router();
let News = require('../models/news.model');

router.route('/').get((req, res) => {
    News.find()
        .then(news => res.json(news))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const image = req.body.image;
    const text = req.body.text;
    const title = req.body.title;

    const newArticle = new News({
        image,
        text,
        title
    });

    newArticle.save()
        .then(() => res.json('Article added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').delete((req, res) => {
    News.remove({})
        .then(() => res.json('News deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;