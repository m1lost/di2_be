exports.hasMaxLength = (value = '', max = 255) => {
  return typeof value === 'string' && value.length <= max;
};

exports.hasMaxTextLength = (value = '', max = 5000) => {
  return typeof value === 'string' && value.length <= max;
};

exports.isValidEmail = (email = '') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

exports.isValidPassword = (password = '') => {
  return password.length >= 8;
};

exports.isValidStock = (value) => {
  return Number.isInteger(Number(value)) && Number(value) >= 0;
};

exports.isValidPrice = (value) => {
  return !isNaN(value) && Number(value) >= 0;
};

exports.isPositiveNumber = (value) => {
  return Number(value) > 0;
};

exports.isValidPhoneNumber = (phone = '') => {
  return /^[0-9]{10,15}$/.test(phone);
};

exports.isBoolean = (value) => {
  return typeof value === 'boolean';
};
