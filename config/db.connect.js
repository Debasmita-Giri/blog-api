const Sequelize = require("sequelize");
const DB_CONFIG = require("./db.config.js");
const UserModel = require("../models/User.js");
const PostModel = require("../models/Post.js");
const CommentModel = require("../models/Comment.js");
const CategoryModel = require("../models/Category.js");

// Initialize Sequelize instance
const sequelize = new Sequelize(DB_CONFIG.DB,DB_CONFIG.USER,DB_CONFIG.PASSWORD,
  {
    host: DB_CONFIG.HOST,
    dialect: DB_CONFIG.dialect,
    logging: false,
    pool: {
      max: DB_CONFIG.pool.max,
      min: DB_CONFIG.pool.min,
      acquire: DB_CONFIG.pool.acquire,
      idle: DB_CONFIG.pool.idle,
    },
  }
);

// Authenticate the DB connection
const authenticateDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully!');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

// Sync the DB models
const syncDB = async () => {
  try {   
      await sequelize.sync({ alter: true }); 
      console.log('Models are synced with the database');   
  } catch (err) {
    console.error('Error syncing models:', err);
  }
};

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = UserModel(sequelize, Sequelize);
db.Post = PostModel(sequelize, Sequelize,db.User);
db.Comment = CommentModel(sequelize, Sequelize,db.User,db.Post);
db.Category = CategoryModel(sequelize, Sequelize);

// One-to-many relationship between User and Post
db.User.hasMany(db.Post, { foreignKey: 'author_id' });
db.Post.belongsTo(db.User, { foreignKey: 'author_id' });

// One-to-many relationship between Post and Comment
db.Post.hasMany(db.Comment, { foreignKey: 'post_id' });
db.Comment.belongsTo(db.Post, { foreignKey: 'post_id' });

// One-to-many relationship between User and Comment
db.User.hasMany(db.Comment, { foreignKey: 'author_id' });
db.Comment.belongsTo(db.User, { foreignKey: 'author_id' });

// One-to-many relationship between Post and Category
db.Post.belongsTo(db.Category, { foreignKey: 'category_id' });
db.Category.hasMany(db.Post, { foreignKey: 'category_id' });

db.initializeDB = async () => {
  await authenticateDB();  
  await syncDB();          
};

module.exports = db; 