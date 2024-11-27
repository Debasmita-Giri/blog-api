const db = require('../config/db.connect.js');
const { ValidationError, UniqueConstraintError, Sequelize } = require('sequelize');

const createCategory = async (categories) => {
  try {
    const createdCategories = [];
    for (const { name, description } of categories) {
      if (!name?.trim() || !description?.trim()) {
        throw { status: 400, message: 'Category name and description are required and cannot be blank' };
      }    
    const newCategory = await db.Category.create({ name, description });
      createdCategories.push(newCategory);
  }
      return createdCategories;
    } 
  catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw { status: 409, message: err.errors.map(e => `${e.path} already exists`).join(', ') };
    }
    if (err instanceof Sequelize.DatabaseError) {
        throw { status: 500, message: 'Database error' };
      }
      throw { status: err.status || 500, message: err.message || 'Error creating category' };
  }
};

const getCategories = async () => {
  try {
    const categories = await db.Category.findAll();
    if (!categories || categories.length === 0) {
      throw { status: 404, message: 'No categories found' };
    }
    return categories;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
        throw { status: 500, message: 'Database error' };
      }
      throw { status: err.status || 500, message: err.message || 'Error fetching categories' };
  }
};

const getCategoryById = async (categoryId) => {
  try {
    if (!categoryId || isNaN(categoryId)) {
      throw { status: 400, message: 'Invalid category ID' };
    }

    const category = await db.Category.findByPk(categoryId);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }
    return category;
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
        throw { status: 500, message: 'Database error' };
      }
      throw { status: err.status || 500, message: err.message || 'Error fetching category' };
  }
};

const updateCategory = async (categoryId, { name, description }) => {
  try {
    if (!categoryId || isNaN(categoryId)) {
      throw { status: 400, message: 'Invalid category ID' };
    }
    if ((!name || name.trim() === '') && (!description || description.trim() === '')) {
      throw { status: 400, message: 'At least one field (name or description) must be provided' };
    }

    if (name) {
      const existingCategory = await db.Category.findOne({ where: { name } });
      if (existingCategory && existingCategory.category_id !== parseInt(categoryId)) {
        throw { status: 400, message: 'Category name already exists' };
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const [updated] = await db.Category.update(updateData, {
      where: { category_id: categoryId },
    });

    if (!updated) {
      throw { status: 404, message: 'Category not found' };
    }

    return db.Category.findByPk(categoryId);
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
        throw { status: 500, message: 'Database error' };
      }
      throw { status: err.status || 500, message: err.message || 'Error updating category' };
  }
};

const deleteCategory = async (categoryId) => {
  try {
    if (!categoryId || isNaN(categoryId)) {
      throw { status: 400, message: 'Invalid category ID' };
    }

    const category = await db.Category.findByPk(categoryId);
    if (!category) {
      throw { status: 404, message: 'Category not found' };
    }

    await db.Category.destroy({ where: { category_id: categoryId } });
  } catch (err) {
    if (err instanceof Sequelize.DatabaseError) {
        throw { status: 500, message: 'Database error' };
      }
      throw { status: err.status || 500, message: err.message || 'Error deleting category' };
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
