const { DataTypes } = require('sequelize');

module.exports = (sequelize,Sequelize) => {
  const Category = sequelize.define('Category', {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,      
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['name'] 
      }
    ]
  });
  return Category;
};
