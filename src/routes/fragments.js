// src/routes/fragments.js
const express = require('express');
const Fragment = require('../model/fragment');
const {
  isSupportedType,
  isTextType,
  isImageType,
  extensionToContentType,
} = require('../utils/content-types');
const { convertFragmentData } = require('../utils/conversions');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const contentType = req.headers['content-type'];

    if (!contentType || !isSupportedType(contentType)) {
      return res.status(415).json({
        status: 'error',
        error: { message: 'Unsupported content type' },
      });
    }

    const rawBody = req.body;
    let buffer;

    if (isTextType(contentType)) {
      if (!rawBody || typeof rawBody !== 'string') {
        return res.status(400).json({
          status: 'error',
          error: { message: 'Text body is required' },
        });
      }
      buffer = Buffer.from(rawBody, 'utf8');
    } else if (isImageType(contentType)) {
      return res.status(400).json({
        status: 'error',
        error: { message: 'Binary body parsing not implemented in this skeleton' },
      });
    } else {
      return res.status(415).json({
        status: 'error',
        error: { message: 'Unsupported content type' },
      });
    }

    const fragment = await Fragment.create(ownerId, contentType, buffer.length);
    await fragment.setData(buffer);

    return res.status(201).json({
      status: 'ok',
      fragment,
      location: `/v1/fragments/${fragment.id}`,
    });
  } catch (err) {
    return next(err);
  }
});

// List fragments
router.get('/', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const expand = req.query.expand === '1';

    const result = await Fragment.byUser(ownerId, expand);

    return res.json({
      status: 'ok',
      fragments: result,
    });
  } catch (err) {
    return next(err);
  }
});

// Get converted fragment: MUST be before /:id route
router.get('/:id.:ext', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id, ext } = req.params;

    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        error: { message: 'Fragment not found' },
      });
    }

    const targetType = extensionToContentType(ext);
    if (!targetType) {
      return res.status(415).json({
        status: 'error',
        error: { message: 'Unsupported target type' },
      });
    }

    const data = await fragment.getData();
    const converted = await convertFragmentData(fragment, data, ext);

    res.setHeader('Content-Type', targetType);
    return res.send(converted);
  } catch (err) {
    if (
      err.message === 'Unsupported target type' ||
      err.message === 'Unsupported conversion'
    ) {
      return res.status(415).json({
        status: 'error',
        error: { message: err.message },
      });
    }
    return next(err);
  }
});

// Get raw fragment data
router.get('/:id/raw', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        error: { message: 'Fragment not found' },
      });
    }

    const data = await fragment.getData();

    res.setHeader('Content-Type', fragment.type);
    return res.send(data);
  } catch (err) {
    return next(err);
  }
});

// Get fragment metadata
router.get('/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        error: { message: 'Fragment not found' },
      });
    }

    return res.json({
      status: 'ok',
      fragment,
    });
  } catch (err) {
    return next(err);
  }
});

// Update fragment
router.put('/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const contentType = req.headers['content-type'];

    if (!contentType || !isSupportedType(contentType)) {
      return res.status(415).json({
        status: 'error',
        error: { message: 'Unsupported content type' },
      });
    }

    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        error: { message: 'Fragment not found' },
      });
    }

    if (fragment.type !== contentType) {
      return res.status(400).json({
        status: 'error',
        error: { message: 'Content type does not match existing fragment type' },
      });
    }

    const rawBody = req.body;
    let buffer;

    if (isTextType(contentType)) {
      if (!rawBody || typeof rawBody !== 'string') {
        return res.status(400).json({
          status: 'error',
          error: { message: 'Text body is required' },
        });
      }
      buffer = Buffer.from(rawBody, 'utf8');
    } else if (isImageType(contentType)) {
      return res.status(400).json({
        status: 'error',
        error: { message: 'Binary body parsing not implemented in this skeleton' },
      });
    } else {
      return res.status(415).json({
        status: 'error',
        error: { message: 'Unsupported content type' },
      });
    }

    await fragment.setData(buffer);

    return res.json({
      status: 'ok',
      fragment,
    });
  } catch (err) {
    return next(err);
  }
});

// Delete fragment
router.delete('/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const fragment = await Fragment.byId(ownerId, id);

    if (!fragment) {
      return res.status(404).json({
        status: 'error',
        error: { message: 'Fragment not found' },
      });
    }

    await fragment.delete();

    return res.status(200).json({
      status: 'ok',
    });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
