/**
 * CJS stub for ESM "slash" package so Jest can load it without ESM transform.
 * Used only in tests via moduleNameMapper.
 */
function slash(path) {
  if (path == null) return path;
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);
  if (isExtendedLengthPath || hasNonAscii) return path;
  return path.replace(/\\/g, '/');
}

module.exports = slash;
