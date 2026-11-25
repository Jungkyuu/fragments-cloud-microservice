// src/routes/index.js
const express = require('express');
const health = require('./health');
const fragments = require('./fragments');
const basicAuth = require('../auth/basic-auth');

const router = express.Router();

router.use('/health', health);

router.use(basicAuth);
router.use('/fragments', fragments);

module.exports = router;
