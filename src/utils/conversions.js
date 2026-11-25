// src/utils/conversions.js
const sharp = require('sharp');
const { marked } = require('marked');
const {
  extensionToContentType,
  isTextType,
  isImageType,
} = require('./content-types');

async function convertFragmentData(fragment, buffer, targetExt) {
  const sourceType = fragment.type.toLowerCase().split(';')[0];
  const targetType = extensionToContentType(targetExt);

  if (!targetType) {
    throw new Error('Unsupported target type');
  }

  if (isTextType(sourceType)) {
    const text = buffer.toString('utf8');

    if (targetType === 'text/plain') {
      if (sourceType === 'application/json') {
        return Buffer.from(JSON.stringify(JSON.parse(text), null, 2), 'utf8');
      }
      return Buffer.from(text, 'utf8');
    }

    if (targetType === 'text/markdown') {
      if (sourceType === 'text/markdown') return buffer;
      throw new Error('Unsupported conversion');
    }

    if (targetType === 'text/html') {
      if (sourceType === 'text/markdown') {
        const html = marked.parse(text);
        return Buffer.from(html, 'utf8');
      }
      if (sourceType === 'text/html') return buffer;
      throw new Error('Unsupported conversion');
    }

    if (targetType === 'application/json') {
      if (sourceType === 'application/json') return buffer;
      throw new Error('Unsupported conversion');
    }

    throw new Error('Unsupported conversion');
  }

  if (isImageType(sourceType)) {
    let image = sharp(buffer);

    switch (targetType) {
      case 'image/png':
        return image.png().toBuffer();
      case 'image/jpeg':
        return image.jpeg().toBuffer();
      case 'image/webp':
        return image.webp().toBuffer();
      case 'image/gif':
        return image.gif().toBuffer();
      default:
        throw new Error('Unsupported image target type');
    }
  }

  throw new Error('Unsupported source type');
}

module.exports = {
  convertFragmentData,
};
