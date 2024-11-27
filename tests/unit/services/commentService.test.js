const db = require('../../../config/db.connect'); 
const commentService = require('../../../services/commentService');
const Sequelize = require('sequelize'); 
const { isUUID } = require('validator'); 

jest.mock('../../../config/db.connect', () => ({
  Comment: {
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
  Post: {
    findByPk: jest.fn(),
  },
}));

jest.mock('validator', () => ({
    isUUID: jest.fn(),
  }));

describe('Comment Service', () => { 
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment if the post exists and content is valid', async () => {
      
      const postData = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is a comment.',
      };
      const authorId = '123e4567-e89b-12d3-a456-426614174000';

      isUUID.mockReturnValue(true);
     
      db.Post.findByPk.mockResolvedValue({ post_id: postData.post_id });

      
      db.Comment.create.mockResolvedValue({
        content: postData.content,
        post_id: postData.post_id,
        author_id: authorId,
      });

      
      const result = await commentService.createComment(postData, authorId);

     
      expect(result.content).toBe(postData.content);
      expect(result.post_id).toBe(postData.post_id);
      expect(result.author_id).toBe(authorId);
      expect(db.Post.findByPk).toHaveBeenCalledWith(postData.post_id);
      expect(db.Comment.create).toHaveBeenCalledWith({
        content: postData.content,
        post_id: postData.post_id,
        author_id: authorId,
      });
    });

    it('should throw 404 error if the post does not exist', async () => {
      const postData = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is a comment.',
      };
      const authorId = '123e4567-e89b-12d3-a456-426614174000';

     
      db.Post.findByPk.mockResolvedValue(null);

      
      try {
        await commentService.createComment(postData, authorId);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Post not found');
      }
    });

    it('should throw 400 error if content is missing or blank', async () => {
      const postData = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        content: '', 
      };
      const authorId = '123e4567-e89b-12d3-a456-426614174000';

      
      db.Post.findByPk.mockResolvedValue({ post_id: postData.post_id });

     
      try {
        await commentService.createComment(postData, authorId);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Content is required');
      }
    });

    it('should throw 500 error if there is a database error', async () => {
      const postData = {
        post_id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'This is a comment.',
      };
      const authorId = '123e4567-e89b-12d3-a456-426614174000';

      
      db.Post.findByPk.mockResolvedValue({ post_id: postData.post_id });

      
      db.Comment.create.mockRejectedValue(new Sequelize.DatabaseError('Database error'));

    
      try {
        await commentService.createComment(postData, authorId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });
  });

  describe('getCommentsByPost', () => {
    it('should return comments for a valid post_id', async () => {
      const post_id = '123e4567-e89b-12d3-a456-426614174000';
  
    
      isUUID.mockReturnValue(true);
  
     
      db.Post.findByPk.mockResolvedValue({ post_id, title: 'Sample Post' });
  
     
      const comments = [
        { content: 'This is a comment.', post_id },
        { content: 'This is another comment.', post_id },
      ];
      db.Comment.findAll.mockResolvedValue(comments);
  
      
      const result = await commentService.getCommentsByPost(post_id);
  
      
      expect(result).toEqual(comments);
      expect(db.Post.findByPk).toHaveBeenCalledWith(post_id);
      expect(db.Comment.findAll).toHaveBeenCalledWith({ where: { post_id } });
      expect(isUUID).toHaveBeenCalledWith(post_id);
    });
  
    it('should throw 404 error if the post does not exist', async () => {
      const post_id = '123e4567-e89b-12d3-a456-426614174000';
  
    
      isUUID.mockReturnValue(true);
  
     
      db.Post.findByPk.mockResolvedValue(null);
  
      try {
        await commentService.getCommentsByPost(post_id);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Post not found');
      }
    });
  
    it('should throw 404 error if no comments are found for the post', async () => {
      const post_id = '123e4567-e89b-12d3-a456-426614174000';
  
     
      isUUID.mockReturnValue(true);
  
      
      db.Post.findByPk.mockResolvedValue({ post_id, title: 'Sample Post' });
  
     
      db.Comment.findAll.mockResolvedValue([]);
  
      try {
        await commentService.getCommentsByPost(post_id);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('No comments found for this post');
      }
    });
  
    it('should throw 400 error for an invalid post_id', async () => {
   
      const post_id = 'invalid-id';
  
     
      isUUID.mockReturnValue(false);
  
      try {
        await commentService.getCommentsByPost(post_id);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid post ID');
      }
    });
  
    it('should throw 500 error if there is a database error', async () => {
     
      const post_id = '123e4567-e89b-12d3-a456-426614174000';
  
    
      isUUID.mockReturnValue(true);
  
   
      db.Post.findByPk.mockResolvedValue({ post_id, title: 'Sample Post' });
  
    
      db.Comment.findAll.mockRejectedValue(new Sequelize.DatabaseError('Database error'));
  
      try {
        await commentService.getCommentsByPost(post_id);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });
  
    it('should throw 500 error for a generic error', async () => {
    
      const post_id = '123e4567-e89b-12d3-a456-426614174000';
  
    
      isUUID.mockReturnValue(true);
  
     
      db.Post.findByPk.mockResolvedValue({ post_id, title: 'Sample Post' });
  
    
      db.Comment.findAll.mockRejectedValue(new Error(''));
  
     
      try {
        await commentService.getCommentsByPost(post_id);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Error fetching comments');
      }
    });
  });
  
  describe('getCommentById', () => {
    beforeEach(() => {
      jest.clearAllMocks(); 
    });
  
    it('should return a comment for a valid commentId', async () => {
      
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockComment = { id: commentId, content: 'This is a comment' };
  
      
      isUUID.mockReturnValue(true);
  
     
      db.Comment.findByPk.mockResolvedValue(mockComment);
  
      
      const result = await commentService.getCommentById(commentId);
  
      expect(result).toEqual(mockComment);
      expect(db.Comment.findByPk).toHaveBeenCalledWith(commentId);
      expect(isUUID).toHaveBeenCalledWith(commentId);
    });
  
    it('should throw 400 error for an invalid commentId format', async () => {
    
      const commentId = 'invalid-id';
  
      
      isUUID.mockReturnValue(false);
  
      
      try {
        await commentService.getCommentById(commentId);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid comment ID');
      }
    });
  
    it('should throw 404 error if the comment is not found', async () => {
     
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
  
   
      isUUID.mockReturnValue(true);
  
     
      db.Comment.findByPk.mockResolvedValue(null);
  
     
      try {
        await commentService.getCommentById(commentId);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Comment not found');
      }
    });
  
    it('should throw 500 error if there is a database error', async () => {
    
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
  
      
      isUUID.mockReturnValue(true);
  
      
      db.Comment.findByPk.mockRejectedValue(new Sequelize.DatabaseError('Database error'));
  
      try {
        await commentService.getCommentById(commentId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });
  
    it('should throw 500 error for a generic error', async () => {
      
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
  
     
      isUUID.mockReturnValue(true);
  
     
      db.Comment.findByPk.mockRejectedValue(new Error(''));
  
  
      try {
        await commentService.getCommentById(commentId);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Error fetching comments');
      }
    });
  });

  describe('updateComment', () => {
    
    it('should update the comment and return the updated comment for a valid commentId and content', async () => {
    
      const user = { userId: '123', userRole: 'user' };
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const commentData = { content: 'Updated content' };
      const mockComment = { id: commentId, content: 'Updated content',author_id:user.userId };
      
  
     
      isUUID.mockReturnValue(true);
  
     
      db.Comment.findByPk.mockResolvedValue(mockComment);
  
      
      db.Comment.update.mockResolvedValue([1]);
  
     
      db.Comment.findByPk.mockResolvedValue(mockComment);
  
      
      const result = await commentService.updateComment(commentId, commentData, user);
  
     
      expect(result).toEqual(mockComment);
      expect(db.Comment.findByPk).toHaveBeenCalledWith(commentId);
      expect(db.Comment.update).toHaveBeenCalledWith(
        { content: commentData.content },
        { where: { comment_id: commentId } }
      );
      expect(isUUID).toHaveBeenCalledWith(commentId);
    });
  
    it('should throw 400 error for an invalid commentId format', async () => {
    
      const commentId = 'invalid-id';
      const commentData = { content: 'Updated content' };
      const user = { userId: '123', userRole: 'user' };
  
      
      isUUID.mockReturnValue(false);
  
     
      try {
        await commentService.updateComment(commentId, commentData, user);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid comment ID');
      }
    });
  
    it('should throw 400 error if content is missing or empty', async () => {
     
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const commentData = { content: '' };
      const user = { userId: '123', userRole: 'user' };
  
     
      isUUID.mockReturnValue(true);
  
     
      try {
        await commentService.updateComment(commentId, commentData, user);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Content is required');
      }
    });
  
    it('should throw 404 error if the comment is not found', async () => {
     
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const commentData = { content: 'Updated content' };
      const user = { userId: '123', userRole: 'user' };
  
     
      isUUID.mockReturnValue(true);
  
    
      db.Comment.findByPk.mockResolvedValue(null);
  
      
      try {
        await commentService.updateComment(commentId, commentData, user);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Comment not found');
      }
    });
  
    it('should throw 403 error if the user is not authorized to update the comment', async () => {
     
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const commentData = { content: 'Updated content' };
      const user = { userId: '456', userRole: 'user' };
      const mockComment = { id: commentId, author_id: '123' };
    
      
      isUUID.mockReturnValue(true);
  
      
      db.Comment.findByPk.mockResolvedValue(mockComment);
  
      
      try {
        await commentService.updateComment(commentId, commentData, user);
      } catch (err) {
        expect(err.status).toBe(403);
        expect(err.message).toBe('You are not authorized to update this comment');
      }
    });
  
    it('should throw 500 error if there is a database error', async () => {
    
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const commentData = { content: 'Updated content' };
      const user = { userId: '123', userRole: 'user' };
  
    
      isUUID.mockReturnValue(true);
  
      
      db.Comment.findByPk.mockRejectedValue(new Sequelize.DatabaseError('Database error'));
  
      
      try {
        await commentService.updateComment(commentId, commentData, user);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });
  
    it('should throw 500 error for a generic error', async () => {
      
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const commentData = { content: 'Updated content' };
      const user = { userId: '123', userRole: 'user' };
  
      
      isUUID.mockReturnValue(true);
  
      
      db.Comment.findByPk.mockRejectedValue(new Error(''));
  
     
      try {
        await commentService.updateComment(commentId, commentData, user);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Error updating comments');
      }
    });
  });

  describe('deleteComment', () => {  
    it('should delete the comment and return a success message for valid commentId and authorization', async () => {
     
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123';
      const userRole = 'user';
      const mockComment = { id: commentId, author_id: '123', Post: { author_id: '456' } };
  
     
      isUUID.mockReturnValue(true);
  
    
      db.Comment.findByPk.mockResolvedValue(mockComment);
  
   
      db.Comment.destroy.mockResolvedValue(1);
  
      
      const result = await commentService.deleteComment(commentId, userId, userRole);
  
    
      expect(result.message).toBe('Comment deleted');
      expect(db.Comment.findByPk).toHaveBeenCalledWith(commentId, {
        include: {
          model: db.Post,
          attributes: ['author_id'],
        },
      });
      expect(db.Comment.destroy).toHaveBeenCalledWith({ where: { comment_id: commentId } });
      expect(isUUID).toHaveBeenCalledWith(commentId);
    });
  
    it('should throw 400 error for an invalid commentId format', async () => {
     
      const commentId = 'invalid-id';
      const userId = '123';
      const userRole = 'user';
  
      
      isUUID.mockReturnValue(false);
  
      
      try {
        await commentService.deleteComment(commentId, userId, userRole);
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe('Invalid comment ID');
      }
    });
  
    it('should throw 404 error if the comment is not found', async () => {
    
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123';
      const userRole = 'user';
  
      
      isUUID.mockReturnValue(true);
  
      
      db.Comment.findByPk.mockResolvedValue(null);
  
     
      try {
        await commentService.deleteComment(commentId, userId, userRole);
      } catch (err) {
        expect(err.status).toBe(404);
        expect(err.message).toBe('Comment not found');
      }
    });
  
    it('should throw 403 error if the user is not authorized to delete the comment', async () => {
      
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123'; 
      const userRole = 'user';
      const mockComment = { id: commentId, author_id: '456', Post: { author_id: '789' } }; 

      isUUID.mockReturnValue(true);
  
      
      db.Comment.findByPk.mockResolvedValue(mockComment);
  
     
      try {
        await commentService.deleteComment(commentId, userId, userRole);
      } catch (err) {
        expect(err.status).toBe(403);
        expect(err.message).toBe('You are not authorized to delete this comment');
      }
    });
  
    it('should throw 500 error if there is a database error', async () => {
    
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123';
      const userRole = 'user';
  
     
      isUUID.mockReturnValue(true);
  
     
      db.Comment.findByPk.mockRejectedValue(new Sequelize.DatabaseError('Database error'));
  
     
      try {
        await commentService.deleteComment(commentId, userId, userRole);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Database error');
      }
    });
  
    it('should throw 500 error for a generic error', async () => {
    
      const commentId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = '123';
      const userRole = 'user';
  
     
      isUUID.mockReturnValue(true);
  
     
      db.Comment.findByPk.mockRejectedValue(new Error(''));
  
      
      try {
        await commentService.deleteComment(commentId, userId, userRole);
      } catch (err) {
        expect(err.status).toBe(500);
        expect(err.message).toBe('Error deleting comments');
      }
    });
  });

});
