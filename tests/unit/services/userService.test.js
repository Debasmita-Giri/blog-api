const userService = require('../../../services/userService');
const db = require('../../../config/db.connect');
const { UniqueConstraintError, ValidationError, Sequelize } = require('sequelize');
const { isUUID } = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
jest.mock('../../../config/db.connect', () => ({
  User: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
    rawAttributes: {
      role: {
        values: ['admin', 'user'],
      },
    },
  },
}));
jest.mock('bcrypt', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('validator', () => ({
  ...jest.requireActual('validator'),
  isUUID: jest.fn(),
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user when all fields are valid', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      db.User.create.mockResolvedValue(userData);

      const result = await userService.createUser(userData);

      expect(result).toEqual(userData);
      expect(db.User.create).toHaveBeenCalledWith(userData);
    });

    it('should throw an error if username, email, or password is missing', async () => {
      const userData = { username: '', email: '', password: '' };

      try {
        await userService.createUser(userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Username, email, and password are required');
      }
    });

    it('should throw an error if role is invalid', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'invalidRole',
      };

      try {
        await userService.createUser(userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid role specified');
      }
    });

    it('should throw a 409 error if there is a unique constraint violation', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new UniqueConstraintError({ errors: [{ path: 'email' }] });
      db.User.create.mockRejectedValue(error);

      try {
        await userService.createUser(userData);
      } catch (err) {
        expect(err.status).toBe(409);
        expect(err.message).toBe('email already exists');
      }
    });

    it('should throw a 422 error if validation fails', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new ValidationError('Validation failed', [
        { path: 'email' },
      ]);
      db.User.create.mockRejectedValue(error);

      try {
        await userService.createUser(userData);
      } catch (err) {
        expect(err.status).toBe(422);
        expect(err.message).toBe('Invalid email');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Sequelize.DatabaseError('');
      db.User.create.mockRejectedValue(error);

      try {
        await userService.createUser(userData);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error for other issues', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Some unknown error');
      db.User.create.mockRejectedValue(error);

      try {
        await userService.createUser(userData);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('getAllUsers', () => {
    it('should return a list of users when the database call is successful', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' },
      ];

      db.User.findAll.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(db.User.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw a 500 error if there is a database error', async () => {
      const error = new Sequelize.DatabaseError('');
      db.User.findAll.mockRejectedValue(error);

      try {
        await userService.getAllUsers();
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a 500 error for other errors', async () => {
      const error = new Error('Some unknown error');
      db.User.findAll.mockRejectedValue(error);

      try {
        await userService.getAllUsers();
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Error fetching users');
      }
    });
  });

  describe('getUserById', () => {
    it('should return the user if a valid UUID is provided and the user exists', async () => {
      const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000', username: 'testuser', email: 'test@example.com' };
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      db.User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(db.User.findByPk).toHaveBeenCalledWith(userId);
    });

    it('should throw a 400 error if the user ID is not a valid UUID', async () => {
      const invalidUserId = 'invalid-id';
      isUUID.mockReturnValue(false);

      try {
        await userService.getUserById(invalidUserId);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid user ID format');
      }
    });

    it('should throw a 404 error if the user is not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      db.User.findByPk.mockResolvedValue(null); 

      try {
        await userService.getUserById(userId);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('User not found');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      const error = new Sequelize.DatabaseError('');
      db.User.findByPk.mockRejectedValue(error);

      try {
        await userService.getUserById(userId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      const error = new Error('Some unknown error');
      db.User.findByPk.mockRejectedValue(error);

      try {
        await userService.getUserById(userId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('updateUser', () => {
    it('should update the user successfully if the user is authorized and all fields are valid', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(true);
      db.User.update.mockResolvedValue([1]); 

      const result = await userService.updateUser(userId, mockUser, userData);

      expect(result).toEqual({ message: 'User updated successfully' });
      expect(db.User.update).toHaveBeenCalledWith(userData, { where: { user_id: userId }, individualHooks: true });
    });

    it('should throw a 400 error if the user ID is not a valid UUID', async () => {
      const invalidUserId = 'invalid-id';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(false);

      try {
        await userService.updateUser(invalidUserId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid user ID format');
      }
    });

    it('should throw a 400 error if the user is not authorized to update', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'different-user-id', role: 'user' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(true);

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('You are not authorized to update this user');
      }
    });

    it('should throw a 400 error if none of the required fields are provided or are blank', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: '', email: '', password: '', role: '' };
      isUUID.mockReturnValue(true);

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('At least one of username, password, email, or role must be provided and non-blank');
      }
    });

    it('should throw a 400 error if a blank field is provided after trimming', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: '', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(true);

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Email cannot be blank');
      }
    });

    it('should throw a 400 error if the role is invalid', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'invalidRole' };
      isUUID.mockReturnValue(true);

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid role specified');
      }
    });

    it('should throw a 404 error if the user to be updated is not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(true);
      db.User.update.mockResolvedValue([0]); 

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('User not found');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(true);
      const error = new Sequelize.DatabaseError('');
      db.User.update.mockRejectedValue(error);

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000', role: 'admin' };
      const userData = { username: 'updatedUser', email: 'updated@example.com', password: 'newpassword', role: 'user' };
      isUUID.mockReturnValue(true);
      const error = new Error('Some unknown error');
      db.User.update.mockRejectedValue(error);

      try {
        await userService.updateUser(userId, mockUser, userData);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete the user successfully if the user ID is valid and the user exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      db.User.destroy.mockResolvedValue(1); 

      const result = await userService.deleteUser(userId);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(db.User.destroy).toHaveBeenCalledWith({ where: { user_id: userId } });
    });

    it('should throw a 400 error if the user ID is not a valid UUID', async () => {
      const invalidUserId = 'invalid-id';
      isUUID.mockReturnValue(false);

      try {
        await userService.deleteUser(invalidUserId);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid user ID format');
      }
    });

    it('should throw a 404 error if the user to be deleted does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      db.User.destroy.mockResolvedValue(0); 

      try {
        await userService.deleteUser(userId);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('User not found');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      const error = new Sequelize.DatabaseError('');
      db.User.destroy.mockRejectedValue(error);

      try {
        await userService.deleteUser(userId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      const error = new Error('Some unknown error');
      db.User.destroy.mockRejectedValue(error);

      try {
        await userService.deleteUser(userId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('loginUser', () => {
    it('should log in the user successfully with valid username and password', async () => {
      const username = 'validUser';
      const password = 'validPassword';
      const user = { user_id: 1, username: 'validUser', password: bcrypt.hashSync('validPassword', 10), role: 'user' };
      
      db.User.findOne.mockResolvedValue(user); 
      bcrypt.compareSync.mockReturnValue(true); 
      jwt.sign.mockReturnValue('mockedJwtToken'); 

      const result = await userService.loginUser(username, password);

      expect(result).toEqual({
        message: 'Login successful',
        token: 'mockedJwtToken',
      });
      expect(db.User.findOne).toHaveBeenCalledWith({ where: { username } });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, user.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: user.user_id, username: user.username, role: user.role },
        process.env.SECRET_KEY_JWT,
        { expiresIn: '1h' }
      );
    });

    it('should throw 400 error if username or password is missing', async () => {
      try {
        await userService.loginUser('', 'password');
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Username and password are required');
      }

      try {
        await userService.loginUser('username', '');
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Username and password are required');
      }
    });

    it('should throw 404 error if user is not found', async () => {
      const username = 'nonExistentUser';
      const password = 'somePassword';
      db.User.findOne.mockResolvedValue(null); 

      try {
        await userService.loginUser(username, password);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('User not found');
      }
    });

    it('should throw 401 error if password is invalid', async () => {
      const username = 'validUser';
      const password = 'wrongPassword';
      const user = { user_id: 1, username: 'validUser', password: bcrypt.hashSync('validPassword', 10), role: 'user' };

      db.User.findOne.mockResolvedValue(user); 
      bcrypt.compareSync.mockReturnValue(false); 

      try {
        await userService.loginUser(username, password);
      } catch (err) {
        expect(err.status).toBe(401);
        expect(err.message).toBe('Invalid password');
      }
    });

    it('should throw 500 error if there is a database error', async () => {
      const username = 'validUser';
      const password = 'validPassword';
      const error = new Sequelize.DatabaseError('');

      db.User.findOne.mockRejectedValue(error); 

      try {
        await userService.loginUser(username, password);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const username = 'validUser';
      const password = 'validPassword';
      const error = new Error('Some unknown error');

      db.User.findOne.mockRejectedValue(error); 

      try {
        await userService.loginUser(username, password);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });



});
