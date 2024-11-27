const categoryService = require('../services/categoryService');

const createCategory = async (req, res) => {
  try {
    const categories = Array.isArray(req.body) ? req.body : [req.body];
    const createdCategories = await categoryService.createCategory(categories);
    res.status(201).json({
      message: categories.length > 1 ? 'Categories created successfully' : 'Category created successfully',
      data: createdCategories,
    });
  } catch (error) {
    res.status(error.status).json({ message: error.message});
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json({ message: 'Categories fetched successfully', data: categories });
  } catch (error) {
    res.status(error.status).json({ message: error.message});
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({ message: 'Category fetched successfully', data: category });
  } catch (error) {
    res.status(error.status).json({ message: error.message});
  }
};

const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ message: 'Category updated successfully', data: updatedCategory });
  } catch (error) {
    res.status(error.status).json({ message: error.message});
  }
};

const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(error.status).json({ message: error.message});
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
