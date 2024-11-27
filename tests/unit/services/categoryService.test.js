const db = require('../../../config/db.connect'); 
const categoryService = require('../../../services/categoryService');
const { UniqueConstraintError, Sequelize } = require('sequelize');

jest.mock('../../../config/db.connect', () => ({
  Category: {
    create: jest.fn(),
    update: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne:jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('Category Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create categories successfully when valid data is provided', async () => {
      const categories = [
        { name: 'Tech', description: 'Technology-related posts' },
        { name: 'Health', description: 'Health-related posts' },
      ];

      const mockCreatedCategories = categories.map((category) => ({
        ...category,
        id: 1,
      }));

      db.Category.create.mockResolvedValueOnce(mockCreatedCategories[0]);
      db.Category.create.mockResolvedValueOnce(mockCreatedCategories[1]);

      const result = await categoryService.createCategory(categories);

      expect(result).toEqual(mockCreatedCategories);
      expect(db.Category.create).toHaveBeenCalledTimes(2);
      expect(db.Category.create).toHaveBeenCalledWith({
        name: 'Tech',
        description: 'Technology-related posts',
      });
      expect(db.Category.create).toHaveBeenCalledWith({
        name: 'Health',
        description: 'Health-related posts',
      });
    });

    it('should throw error if category name or description is missing', async () => {
      const categories = [
        { name: '', description: 'Description for empty name' },
        { name: 'Valid Category', description: '' },
      ];

      await expect(categoryService.createCategory(categories))
        .rejects
        .toEqual({ status: 400, message: 'Category name and description are required and cannot be blank' });

      expect(db.Category.create).not.toHaveBeenCalled();
    });

    it('should throw error if category already exists', async () => {
      const categories = [
        { name: 'Existing Category', description: 'Some description' },
      ];
      
      const mockError = new UniqueConstraintError({ errors: [{ path: 'name' }] });
     
      mockError.errors = [{ path: 'name' }];
      db.Category.create.mockRejectedValueOnce(mockError);

      await expect(categoryService.createCategory(categories))
        .rejects
        .toEqual({ status: 409, message: 'name already exists' });

      expect(db.Category.create).toHaveBeenCalled();
    });

    it('should throw database error if something goes wrong', async () => {
      const categories = [
        { name: 'Tech', description: 'Technology-related posts' },
      ];

      const mockError = new Sequelize.DatabaseError('Database error');
      db.Category.create.mockRejectedValueOnce(mockError);

      await expect(categoryService.createCategory(categories))
        .rejects
        .toEqual({ status: 500, message: 'Database error' });

      expect(db.Category.create).toHaveBeenCalled();
    });

    it('should throw generic error when an unexpected error occurs', async () => {
      const categories = [
        { name: 'Tech', description: 'Technology-related posts' },
      ];

      const mockError = new Error('Unexpected error');
      db.Category.create.mockRejectedValueOnce(mockError);

      await expect(categoryService.createCategory(categories))
        .rejects
        .toEqual({ status: 500, message: 'Unexpected error' });

      expect(db.Category.create).toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should return categories when categories exist', async () => {
      const mockCategories = [
        { id: 1, name: 'Tech', description: 'Technology-related posts' },
        { id: 2, name: 'Health', description: 'Health-related posts' },
      ];

      db.Category.findAll.mockResolvedValueOnce(mockCategories);

      const result = await categoryService.getCategories();

      expect(result).toEqual(mockCategories);
      expect(db.Category.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error if no categories are found', async () => {
      db.Category.findAll.mockResolvedValueOnce([]);

      await expect(categoryService.getCategories())
        .rejects
        .toEqual({ status: 404, message: 'No categories found' });

      expect(db.Category.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw database error if there is a database issue', async () => {
      const mockError = new Sequelize.DatabaseError('Database error');
      db.Category.findAll.mockRejectedValueOnce(mockError);

      await expect(categoryService.getCategories())
        .rejects
        .toEqual({ status: 500, message: 'Database error' });

      expect(db.Category.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw generic error if something unexpected happens', async () => {
      const mockError = new Error('Unexpected error');
      db.Category.findAll.mockRejectedValueOnce(mockError);

      await expect(categoryService.getCategories())
        .rejects
        .toEqual({ status: 500, message: 'Unexpected error' });

      expect(db.Category.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCategoryById', () => {
    it('should return category when category exists', async () => {
      const mockCategory = { id: 1, name: 'Tech', description: 'Technology-related posts' };

      db.Category.findByPk.mockResolvedValueOnce(mockCategory);

      const result = await categoryService.getCategoryById(1);

      expect(result).toEqual(mockCategory);
      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw error if category not found', async () => {
      db.Category.findByPk.mockResolvedValueOnce(null);

      await expect(categoryService.getCategoryById(1))
        .rejects
        .toEqual({ status: 404, message: 'Category not found' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw error for invalid category ID', async () => {
      await expect(categoryService.getCategoryById('invalid'))
        .rejects
        .toEqual({ status: 400, message: 'Invalid category ID' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(0);
    });

    it('should throw database error if there is a database issue', async () => {
      const mockError = new Sequelize.DatabaseError('Database error');
      db.Category.findByPk.mockRejectedValueOnce(mockError);

      await expect(categoryService.getCategoryById(1))
        .rejects
        .toEqual({ status: 500, message: 'Database error' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw generic error if something unexpected happens', async () => {
      const mockError = new Error('Unexpected error');
      db.Category.findByPk.mockRejectedValueOnce(mockError);

      await expect(categoryService.getCategoryById(1))
        .rejects
        .toEqual({ status: 500, message: 'Unexpected error' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
    });
  });

  describe('updateCategory', () => {
    it('should update category when valid data is provided', async () => {
      const mockCategory = { category_id: 1, name: 'Tech', description: 'Updated description' };

      db.Category.findOne.mockResolvedValueOnce(null); 
      db.Category.update.mockResolvedValueOnce([1]); 
      db.Category.findByPk.mockResolvedValueOnce(mockCategory);

      const result = await categoryService.updateCategory(1, { name: 'Tech', description: 'Updated description' });

      expect(result).toEqual(mockCategory);
      expect(db.Category.findOne).toHaveBeenCalledTimes(1);
      expect(db.Category.findOne).toHaveBeenCalledWith({ where: { name: 'Tech' } });
      expect(db.Category.update).toHaveBeenCalledTimes(1);
      expect(db.Category.update).toHaveBeenCalledWith({ name: 'Tech', description: 'Updated description' }, { where: { category_id: 1 } });
      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw error if category name already exists', async () => {
      const mockExistingCategory = { category_id: 2, name: 'Tech', description: 'Some description' };

      db.Category.findOne.mockResolvedValueOnce(mockExistingCategory);

      await expect(categoryService.updateCategory(1, { name: 'Tech', description: 'Updated description' }))
        .rejects
        .toEqual({ status: 400, message: 'Category name already exists' });

      expect(db.Category.findOne).toHaveBeenCalledTimes(1);
      expect(db.Category.findOne).toHaveBeenCalledWith({ where: { name: 'Tech' } });
    });

    it('should throw error if no valid fields are provided', async () => {
      await expect(categoryService.updateCategory(1, { name: '', description: '' }))
        .rejects
        .toEqual({ status: 400, message: 'At least one field (name or description) must be provided' });

      expect(db.Category.update).toHaveBeenCalledTimes(0);
    });

    it('should throw error if category is not found', async () => {
      db.Category.findOne.mockResolvedValueOnce(null);
      db.Category.update.mockResolvedValueOnce([0]); 

      await expect(categoryService.updateCategory(1, { name: 'Updated Tech', description: 'New description' }))
        .rejects
        .toEqual({ status: 404, message: 'Category not found' });

      expect(db.Category.findOne).toHaveBeenCalledTimes(1);
      expect(db.Category.findOne).toHaveBeenCalledWith({ where: { name: 'Updated Tech' } });
      expect(db.Category.update).toHaveBeenCalledTimes(1);
      expect(db.Category.update).toHaveBeenCalledWith({ name: 'Updated Tech', description: 'New description' }, { where: { category_id: 1 } });
    });

    it('should throw database error if there is a database issue', async () => {
      const mockError = new Sequelize.DatabaseError('Database error');
      db.Category.update.mockRejectedValueOnce(mockError);

      await expect(categoryService.updateCategory(1, { name: 'Updated Tech', description: 'New description' }))
        .rejects
        .toEqual({ status: 500, message: 'Database error' });

      expect(db.Category.update).toHaveBeenCalledTimes(1);
      expect(db.Category.update).toHaveBeenCalledWith({ name: 'Updated Tech', description: 'New description' }, { where: { category_id: 1 } });
    });

    it('should throw generic error if something unexpected happens', async () => {
      const mockError = new Error('Unexpected error');
      db.Category.update.mockRejectedValueOnce(mockError);

      await expect(categoryService.updateCategory(1, { name: 'Updated Tech', description: 'New description' }))
        .rejects
        .toEqual({ status: 500, message: 'Unexpected error' });

      expect(db.Category.update).toHaveBeenCalledTimes(1);
      expect(db.Category.update).toHaveBeenCalledWith({ name: 'Updated Tech', description: 'New description' }, { where: { category_id: 1 } });
    });
  });

  describe('deleteCategory', () => {
    it('should delete category when valid categoryId is provided', async () => {
      const mockCategory = { category_id: 1, name: 'Tech', description: 'Category for tech-related posts' };

      db.Category.findByPk.mockResolvedValueOnce(mockCategory); 
      db.Category.destroy.mockResolvedValueOnce(1); 

      await categoryService.deleteCategory(1);

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
      expect(db.Category.destroy).toHaveBeenCalledTimes(1);
      expect(db.Category.destroy).toHaveBeenCalledWith({ where: { category_id: 1 } });
    });

    it('should throw error if categoryId is invalid', async () => {
      await expect(categoryService.deleteCategory('invalid'))
        .rejects
        .toEqual({ status: 400, message: 'Invalid category ID' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(0);
      expect(db.Category.destroy).toHaveBeenCalledTimes(0);
    });

    it('should throw error if category is not found', async () => {
      db.Category.findByPk.mockResolvedValueOnce(null); 

      await expect(categoryService.deleteCategory(1))
        .rejects
        .toEqual({ status: 404, message: 'Category not found' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
      expect(db.Category.destroy).toHaveBeenCalledTimes(0);
    });

    it('should throw database error if there is a database issue', async () => {
      const mockError = new Sequelize.DatabaseError('Database error');
      db.Category.findByPk.mockResolvedValueOnce({ category_id: 1 }); 
      db.Category.destroy.mockRejectedValueOnce(mockError);

      await expect(categoryService.deleteCategory(1))
        .rejects
        .toEqual({ status: 500, message: 'Database error' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
      expect(db.Category.destroy).toHaveBeenCalledTimes(1);
      expect(db.Category.destroy).toHaveBeenCalledWith({ where: { category_id: 1 } });
    });

    it('should throw generic error if something unexpected happens', async () => {
      const mockError = new Error('Unexpected error');
      db.Category.findByPk.mockResolvedValueOnce({ category_id: 1 }); 
      
      db.Category.destroy.mockRejectedValueOnce(mockError);

      await expect(categoryService.deleteCategory(1))
        .rejects
        .toEqual({ status: 500, message: 'Unexpected error' });

      expect(db.Category.findByPk).toHaveBeenCalledTimes(1);
      expect(db.Category.findByPk).toHaveBeenCalledWith(1);
      expect(db.Category.destroy).toHaveBeenCalledTimes(1);
      expect(db.Category.destroy).toHaveBeenCalledWith({ where: { category_id: 1 } });
    });
  });
});
