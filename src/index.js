const express = require('express');
const bodyParser = require('body-parser');

const authController = require('./app/controllers/authController');
const projectsController = require('./app/controllers/projectsController');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/auth', authController);
app.use('/projects', projectsController);

app.listen(3000);