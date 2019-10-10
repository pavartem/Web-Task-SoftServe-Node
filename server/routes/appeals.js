const router = require('express').Router();
let Appeal = require('../models/appeal.model');

router.route('/').get((req, res) => {
  Appeal.find()
    .then(appeals => res.json(appeals))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const user = req.body.username;
  const text = req.body.text;
  const date = req.body.date;

  const newAppeal = new Appeal({user, text, date});

  newAppeal.save()
    .then(() => res.json(newAppeal))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').delete((req, res) => {
  Appeal.remove({})
      .then(() => res.json('Appeals deleted.'))
      .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;