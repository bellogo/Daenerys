const bcrypt = require("bcrypt");

module.exports = password => {
  const hash = bcrypt.hash(password, 10);
  return hash;
};