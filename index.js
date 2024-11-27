const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const db =require('./config/db.connect.js');
const userRoutes = require('./routes/userRoutes'); 
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Use routes
app.use('/api/user', userRoutes);  
app.use('/api/post', postRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/category', categoryRoutes);

const startServer = async () => {
  try {
    await db.initializeDB(); 
    /* 
      Uncomment the line below if you want to populate the database with initial data.
      Make sure to comment it back after the first run to avoid re-seeding the database and causing duplicates. 
     */
    //await require('./scripts/seedData')();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
    process.exit(1); 
  }
};

startServer();

module.exports = app;

