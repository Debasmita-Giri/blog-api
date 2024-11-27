const userService = require('../services/userService');

const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const updateUser = async (req, res) => { 
  try {
    const response = await userService.updateUser(req.params.id, req.user, req.body);
    res.status(200).json(response);
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {  
  try {
    const deleteResponse = await userService.deleteUser(req.params.id);
    res.status(204).json(deleteResponse);
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const loginResponse = await userService.loginUser(username, password);
    res.status(200).json(loginResponse);
  } catch (err) {
    res.status(err.status).json({ message: err.message });
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
