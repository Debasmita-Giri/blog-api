const db = require('../config/db.connect');
const { ValidationError, UniqueConstraintError, Sequelize } = require('sequelize');
const { isUUID } = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (userData) => {
  try {
    if (!userData.username?.trim() || !userData.email?.trim() || !userData.password?.trim()) {
      throw { status: 400, message: 'Username, email, and password are required' };
    }

    const validRoles = db.User.rawAttributes.role.values;

    if (userData.role && !validRoles.includes(userData.role)) {
      throw { status: 400, message: 'Invalid role specified' };
    }

    return await db.User.create(userData);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw { status: 409, message: err.errors.map(e => `${e.path} already exists`).join(', ') };
    }
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => `Invalid ${e.path}`).join(', ');
      throw { status: 422, message: messages };
    }
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw {
      status: err.status || 500,
      message: err.message || 'Error creating user'
    };
  }
};

const getAllUsers = async () => {
  try {
    const users = await db.User.findAll();
    return users;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw { status: 500, message: 'Error fetching users' };
  }
};

const getUserById = async (id) => {
  try {
    if (!isUUID(id)) {
      throw { status: 400, message: 'Invalid user ID format' };
    }
    const user = await db.User.findByPk(id);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    return user;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw {
      status: err.status || 500,
      message: err.message || 'Error fetching user'
    };
  }
};

const updateUser = async (id,user, userData) => {
  try {
    if (!isUUID(id)) {
      throw { status: 400, message: 'Invalid user ID format' };
    }

    if (user.userId !== id && user.role !== 'admin') {
      throw { status: 400, message: 'You are not authorized to update this user' };      }

    
    const checkBlankField = (fieldName, value) => {
      if (value && !value.trim()) {
        throw { status: 400, message: `${fieldName} cannot be blank` };
      }
    };
   
    const requiredFields = ['username', 'password', 'email', 'role'];
    const hasValidField = requiredFields.some(field => userData[field]?.trim());
    if (!hasValidField) {
      throw { status: 400, message: 'At least one of username, password, email, or role must be provided and non-blank' };
    }
    
    ['username', 'password', 'email', 'role'].forEach(field => checkBlankField(field, userData[field]));
    
    const validRoles = db.User.rawAttributes.role.values;
    if (userData.role && !validRoles.includes(userData.role)) {
      throw { status: 400, message: 'Invalid role specified' };
    }
 
    const [updated] = await db.User.update(userData, { where: { user_id: id },individualHooks: true  });

    if (!updated) {
      throw { status: 404, message: 'User not found' };
    }

    return { message: 'User updated successfully' };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw { status: 409, message: err.errors.map(e => `${e.path} already exists`).join(', ') };
    }
    if (err instanceof ValidationError) {
      const messages = err.errors.map(e => `Invalid ${e.path}`).join(', ');
      throw { status: 422, message: messages };
    }
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw {
      status: err.status || 500,
      message: err.message || 'Error updating user'
    };
  }
};

const deleteUser = async (id) => {
  try {
    if (!isUUID(id)) {
      throw { status: 400, message: 'Invalid user ID format' };
    }
    const deleted = await db.User.destroy({ where: { user_id: id } });

    if (!deleted) {
      throw { status: 404, message: 'User not found' };
    }

    return { message: 'User deleted successfully' };
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw {
      status: err.status || 500,
      message: err.message || 'Error deleting user'
    };
  }
};

const loginUser = async (username, password) => {
  try {
    if (!username?.trim() || !password?.trim()) {
      throw { status: 400, message: 'Username and password are required' };
    }

    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw { status: 401, message: 'Invalid password' };
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username, role: user.role },
      process.env.SECRET_KEY_JWT,
      { expiresIn: '1h' }
    );

    return { message: 'Login successful', token };
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
      throw { status: 500, message: 'Database error' };
    }
    throw {
      status: err.status || 500,
      message: err.message || 'Error logging user'
    };
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
};
