const excludedKeywords = ['password', 'token'];

const shouldExclude = (key) => {
  return excludedKeywords.some((keyword) =>
    key.toLowerCase().includes(keyword)
  );
};

const trimStrings = (obj) => {
  if (Array.isArray(obj)) {
    obj.forEach(trimStrings);
    return;
  }

  for (const key in obj) {
    if (shouldExclude(key)) {
      continue;
    }

    const value = obj[key];

    if (typeof value === 'string') {
      obj[key] = value.trim();
    } else if (typeof value === 'object' && value !== null) {
      trimStrings(value);
    }
  }
};

module.exports = (req, res, next) => {
  if (req.body) trimStrings(req.body);
  if (req.query) trimStrings(req.query);
  if (req.params) trimStrings(req.params);

  next();
};
