const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin:admin@mmlcasag-cvtew.mongodb.net/rocketseat-rest-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

mongoose.Promise = global.Promise;

module.exports = mongoose;
