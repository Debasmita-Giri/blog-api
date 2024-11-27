const postService = require('../services/postService');

const createPost = async (req, res) => {
  try {   
    const newPost = await postService.createPost( req.body, req.user.userId );
    res.status(201).json({message: 'Post created successfully', post: newPost});
  } catch (err) {    
    res.status(err.status).json({ message: err.message });
  }
};

const getAllPosts = async (req, res) => {
  try {   
    const posts = await postService.getAllPosts();
    res.status(200).json({message: 'Posts fetched successfully',data: posts});
  } catch (err) {
      res.status(err.status).json({ message: err.message });
  }
};

const getPostById = async (req, res) => {
  try {    
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({ message: 'Post fetched successfully', data: post});
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const getPostsByCategoryId = async (req, res) => {
  try {    
    const posts = await postService.getPostByCategoryId(req.params.id);
    res.status(200).json({ message: 'Posts fetched successfully', data: posts});
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

const updatePost = async (req, res) => {
  try {   
    const result = await postService.updatePost(req.params.id, req.user,req.body);
    res.status(200).json(result);
  } catch (err) {
     res.status(err.status).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {   
    const result = await postService.deletePost(req.params.id, req.user);
    res.status(result.status).json({ message: result.message });
  } catch (err) {
    res.status(err.status).json({ message: err.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostsByCategoryId
};
