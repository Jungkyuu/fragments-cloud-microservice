// src/utils/content-types.js
function extensionToContentType(ext) {
  switch (ext.toLowerCase()) {
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
}

function contentTypeToExtension(contentType) {
  const type = contentType.toLowerCase().split(';')[0];
  switch (type) {
    case 'text/plain':
      return 'txt';
    case 'text/markdown':
      return 'md';
    case 'text/html':
      return 'html';
    case 'application/json':
      return 'json';
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return null;
  }
}

function isSupportedType(contentType) {
  return Boolean(contentTypeToExtension(contentType));
}

function isTextType(contentType) {
  const type = contentType.toLowerCase().split(';')[0];
  return (
    type.startsWith('text/') ||
    type === 'application/json'
  );
}

function isImageType(contentType) {
  const type = contentType.toLowerCase().split(';')[0];
  return type.startsWith('image/');
}

module.exports = {
  extensionToContentType,
  contentTypeToExtension,
  isSupportedType,
  isTextType,
  isImageType,
};
