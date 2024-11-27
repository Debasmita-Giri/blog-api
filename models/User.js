const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt')

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
           
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,           
            validate: {
                isEmail: true,        
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: ['user', 'admin'],
            defaultValue: 'user'
        }
    }, {
        hooks: {
            beforeCreate: (user, options) => {
                user.username = user.username.trim();
                user.password = bcrypt.hashSync(user.password.trim(), 10);
                user.email = user.email.trim();
                if (user.role) {
                    user.role = user.role.trim();
                }                
            },
            beforeUpdate: (user,options) => {
                console.log('Before Update Hook Triggered', user);
                if (user.username) user.username = user.username.trim();
                if (user.password) user.password = bcrypt.hashSync(user.password.trim(), 10);
                if (user.email) user.email = user.email.trim();
                if (user.role) user.role = user.role.trim();
              }
        },
        indexes: [
            {unique:true, fields:['email']},
            {unique:true, fields:['username']}
          ]
    });

    return User;
};

