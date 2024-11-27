const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize,User,Post) => {
  
    const Comment = sequelize.define('Comment', {
        comment_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        post_id: {
          type: DataTypes.UUID,
          references: {
            model: Post,
            key: 'post_id'
          }
        },
        author_id: {
          type: DataTypes.UUID,
          references: {
            model: User,
            key: 'user_id'
          }
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      }, {
        timestamps: false
      });
      
    return Comment;
};

