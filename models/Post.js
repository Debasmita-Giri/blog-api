const { DataTypes } = require('sequelize');
const User=require('./User')
module.exports = (sequelize, Sequelize,User) => {
    const Post = sequelize.define('Post', {
        post_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        author_id: {
          type: DataTypes.UUID,
          references: {
            model: User,
            key: 'user_id'
          }
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false
        },
        content: DataTypes.TEXT,
        status: {
          type: DataTypes.ENUM('draft', 'published'),
          defaultValue: 'draft'
        }
      }, {
        timestamps: true,
        hooks: {
          beforeCreate: (post, options) => {
              post.title = post.title.trim();
              post.content = post.content.trim();                             
          },
          beforeUpdate: (post,options) => {              
            post.title = post.title.trim();
            post.content = post.content.trim();  
            }
      },
      });

    return Post;
};

