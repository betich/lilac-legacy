require('dotenv').config();

module.exports = {
  prefix: process.env.PREFIX || ':3 ',
  token: process.env.TOKEN,
};
