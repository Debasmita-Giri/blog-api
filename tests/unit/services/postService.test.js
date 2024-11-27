const postService = require('../../../services/postService');
const db = require('../../../config/db.connect');
const { ValidationError, UniqueConstraintError, Sequelize } = require('sequelize');
const isUUID = require('uuid').validate;

jest.mock('../../../config/db.connect', () => ({
  Post: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    rawAttributes: {
      status: {
        values: ['draft', 'published'],
      },
    },
  },
}));
jest.mock('uuid', () => ({
    validate: jest.fn(),
  }));

describe('Post Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPost', () => {
    it('should create a post when valid data is provided', async () => {
      const postData = {
        title: 'Valid Post Title',
        content: 'Valid content for the post.',
        status: 'draft',
      };
      const author_id = 'valid-author-id';

      db.Post.create.mockResolvedValue(postData);

      const result = await postService.createPost(postData, author_id);

      expect(result).toEqual(postData);
      expect(db.Post.create).toHaveBeenCalledWith({
        title: postData.title,
        content: postData.content,
        author_id,
        status: postData.status,
      });
    });

    it('should throw an error if title or content is missing or blank', async () => {
      const postData = { title: '', content: '' };
      const author_id = 'valid-author-id';

      await expect(postService.createPost(postData, author_id)).rejects.toEqual({
        status: 400,
        message: 'Title, content are required',
      });
    });

    it('should throw an error if the post status is invalid', async () => {
      const postData = {
        title: 'Post Title',
        content: 'Post content',
        status: 'invalid-status',
      };
      const author_id = 'valid-author-id';

      await expect(postService.createPost(postData, author_id)).rejects.toEqual({
        status: 400,
        message: 'Invalid Post status specified',
      });
    });

    it('should throw a 409 error if there is a unique constraint violation', async () => {
      const postData = {
        title: 'Duplicate Title',
        content: 'Duplicate content',
        status: 'published',
      };
      const author_id = 'valid-author-id';

      const error = new UniqueConstraintError({ errors: [{ path: 'title' }] });
      db.Post.create.mockRejectedValue(error);

      await expect(postService.createPost(postData, author_id)).rejects.toEqual({
        status: 409,
        message: 'title already exists',
      });
    });

    it('should throw a 422 error if validation fails', async () => {
      const postData = {
        title: 'Post Title',
        content: 'Post content',
      };
      const author_id = 'valid-author-id';

      const error = new ValidationError('Validation error', [
        { path: 'title' },
      ]);
      db.Post.create.mockRejectedValue(error);

      await expect(postService.createPost(postData, author_id)).rejects.toEqual({
        status: 422,
        message: 'Invalid title',
      });
    });

    it('should throw a 500 error if there is a database error', async () => {
      const postData = {
        title: 'Post Title',
        content: 'Post content',
        status: 'published',
      };
      const author_id = 'valid-author-id';

      const error = new Sequelize.DatabaseError('Database error');
      db.Post.create.mockRejectedValue(error);

      await expect(postService.createPost(postData, author_id)).rejects.toEqual({
        status: 500,
        message: 'Database error',
      });
    });

    it('should throw a 500 error for generic errors', async () => {
      const postData = {
        title: 'Post Title',
        content: 'Post content',
      };
      const author_id = 'valid-author-id';

      const error = new Error('');
      db.Post.create.mockRejectedValue(error);

      await expect(postService.createPost(postData, author_id)).rejects.toEqual({
        status: 500,
        message: 'Error creating post',
      });
    });
  });

  describe('getAllPosts', () => {
    it('should return posts if posts are found', async () => {
      const posts = [
        { title: 'Post 1', content: 'Content of post 1' },
        { title: 'Post 2', content: 'Content of post 2' },
      ];

      db.Post.findAll.mockResolvedValue(posts);

      const result = await postService.getAllPosts();

      expect(result).toEqual(posts);
      expect(db.Post.findAll).toHaveBeenCalled();
    });

    it('should throw a 404 error if no posts are found', async () => {
      db.Post.findAll.mockResolvedValue([]);

      await expect(postService.getAllPosts()).rejects.toEqual({
        status: 404,
        message: 'No posts found',
      });
    });

    it('should throw a 500 error if there is a database error', async () => {
      const error = new Sequelize.DatabaseError('Database error');
      db.Post.findAll.mockRejectedValue(error);

      await expect(postService.getAllPosts()).rejects.toEqual({
        status: 500,
        message: 'Database error',
      });
    });

    it('should throw a 500 error for generic errors', async () => {
      const error = new Error('');
      db.Post.findAll.mockRejectedValue(error);

      await expect(postService.getAllPosts()).rejects.toEqual({
        status: 500,
        message: 'Error fetching posts',
      });
    });
  });

  describe('getPostById', () => {
    it('should return the post if a valid UUID is provided and the post exists', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockPost = { post_id:postId,title: 'Post Title', content: 'Post Content' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);

      const result = await postService.getPostById(postId);

      expect(result).toEqual(mockPost);
      expect(db.Post.findByPk).toHaveBeenCalledWith(postId);
    });

    it('should throw a 400 error if the post ID is not a valid UUID', async () => {
      const invalidPostId = 'invalid-id';
      isUUID.mockReturnValue(false);

      try {
        await postService.getPostById(invalidPostId);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid post ID');
      }
    });

    it('should throw a 404 error if the post is not found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(null); 
      try {
        await postService.getPostById(postId);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Post not found');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      const error = new Sequelize.DatabaseError('');
      db.Post.findByPk.mockRejectedValue(error);

      try {
        await postService.getPostById(postId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      isUUID.mockReturnValue(true);
      const error = new Error('Some unknown error');
      db.Post.findByPk.mockRejectedValue(error);

      try {
        await postService.getPostById(postId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('getPostByCategoryId', () => {
    it('should return posts if a valid category ID is provided and posts exist for that category', async () => {
      const categoryId = 1;
      const mockPosts = [
        { title: 'Post 1', content: 'Content 1' },
        { title: 'Post 2', content: 'Content 2' }
      ];

      db.Post.findAll.mockResolvedValue(mockPosts);

      const result = await postService.getPostByCategoryId(categoryId);

      expect(result).toEqual(mockPosts);
      expect(db.Post.findAll).toHaveBeenCalledWith({ where: { category_id: categoryId } });
    });

    it('should throw a 400 error if the category ID is not a valid number', async () => {
      const invalidCategoryId = 'invalid-id';

      try {
        await postService.getPostByCategoryId(invalidCategoryId);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid post ID');
      }
    });

    it('should throw a 404 error if no posts are found for the specified category', async () => {
      const categoryId = 1;
      db.Post.findAll.mockResolvedValue([]); 

      try {
        await postService.getPostByCategoryId(categoryId);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('No Posts found for specified category');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const categoryId = 1;
      const error = new Sequelize.DatabaseError('');
      db.Post.findAll.mockRejectedValue(error);

      try {
        await postService.getPostByCategoryId(categoryId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const categoryId = 1;
      const error = new Error('Some unknown error');
      db.Post.findAll.mockRejectedValue(error);

      try {
        await postService.getPostByCategoryId(categoryId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('updatePost', () => {
    it('should update the post successfully if the user is the author or has admin role', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', userRole: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };
      const postData = { title: 'Updated Title', content: 'Updated content', status: 'published' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);
      db.Post.update.mockResolvedValue([1]);

      const result = await postService.updatePost(postId, mockUser, postData);     
      expect(result).toEqual({ message: 'Post updated successfully' });
      expect(db.Post.findByPk).toHaveBeenCalledWith(postId);
      expect(db.Post.update).toHaveBeenCalledWith(postData, { where: { post_id: postId } });
    });

    it('should throw a 403 error if the user is not the author and not an admin', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'another-author-id', userRole: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };
      const postData = { title: 'Updated Title', content: 'Updated content', status: 'published' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);

      try {
        await postService.updatePost(postId, mockUser, postData);
      } catch (err) {
        expect(err.status).toBe(403);
        expect(err.message).toBe('You are not authorized to update this post');
      }
    });

    it('should throw a 404 error if the post is not found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', userRole: 'user' };
      const postData = { title: 'Updated Title', content: 'Updated content', status: 'published' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(null); 

      try {
        await postService.updatePost(postId, mockUser, postData);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Post not found for update');
      }
    });

    it('should throw a 400 error if at least one required field is not provided or blank', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', userRole: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };
      const postData = { title: '', content: '', status: '' }; 

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);

      try {
        await postService.updatePost(postId, mockUser, postData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('At least one of title ,content or status must be provided and non-blank for update');
      }
    });

    it('should throw a 400 error if a field is blank', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', userRole: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };
      const postData = { title: 'Updated Title', content: '', status: 'published' }; 

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);

      try {
        await postService.updatePost(postId, mockUser, postData);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('content cannot be blank');
      }
    });

    it('should throw a 500 error if there is a database error', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', userRole: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };
      const postData = { title: 'Updated Title', content: 'Updated content', status: 'published' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);
      const error = new Sequelize.DatabaseError('');
      db.Post.update.mockRejectedValue(error);

      try {
        await postService.updatePost(postId, mockUser, postData);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', userRole: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };
      const postData = { title: 'Updated Title', content: 'Updated content', status: 'published' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);
      const error = new Error('Some unknown error');
      db.Post.update.mockRejectedValue(error);

      try {
        await postService.updatePost(postId, mockUser, postData);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });

  describe('deletePost', () => {
    it('should delete the post successfully if the user is the author or has admin role', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', role: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);
      db.Post.destroy.mockResolvedValue(1);

      const result = await postService.deletePost(postId, mockUser);

      expect(result).toEqual({ status: 204, message: 'Post deleted' });
      expect(db.Post.findByPk).toHaveBeenCalledWith(postId);
      expect(db.Post.destroy).toHaveBeenCalledWith({ where: { post_id: postId } });
    });

    it('should throw a 403 error if the user is not the author and not an admin', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'another-author-id', role: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);

      try {
        await postService.deletePost(postId, mockUser);
      } catch (err) {
        expect(err.status).toBe(403);
        expect(err.message).toBe('You are not authorized to delete this post');
      }
    });

    it('should throw a 404 error if the post is not found', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', role: 'user' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(null); 

      try {
        await postService.deletePost(postId, mockUser);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Post not found');
      }
    });

    it('should throw a 400 error if the postId is invalid', async () => {
      const postId = 'invalid-post-id';
      const mockUser = { userId: 'author-id', role: 'user' };

      isUUID.mockReturnValue(false);

      try {
        await postService.deletePost(postId, mockUser);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid post ID');
      }
    });

    it('should throw a 500 error if there is a database error during post deletion', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', role: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);
      const error = new Sequelize.DatabaseError('');
      db.Post.destroy.mockRejectedValue(error);

      try {
        await postService.deletePost(postId, mockUser);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });

    it('should throw a generic error if there is an unknown error', async () => {
      const postId = '123e4567-e89b-12d3-a456-426614174000';
      const mockUser = { userId: 'author-id', role: 'user' };
      const mockPost = { post_id: postId, author_id: 'author-id' };

      isUUID.mockReturnValue(true);
      db.Post.findByPk.mockResolvedValue(mockPost);
      const error = new Error('Some unknown error');
      db.Post.destroy.mockRejectedValue(error);

      try {
        await postService.deletePost(postId, mockUser);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Some unknown error');
      }
    });
  });
});
