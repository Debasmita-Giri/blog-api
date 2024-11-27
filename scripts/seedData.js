const bcrypt = require('bcrypt');
const db = require('../config/db.connect'); 

const seedData = async () => {
  try {
    // Predefined user data
    const usersData = [
      { username: 'alice', email: 'alice@example.com' },
      { username: 'bob', email: 'bob@example.com' },
      { username: 'charlie', email: 'charlie@example.com' },
      { username: 'dave', email: 'dave@example.com' },
      { username: 'eve', email: 'eve@example.com' },
      { username: 'frank', email: 'frank@example.com' },
      { username: 'grace', email: 'grace@example.com' },
      { username: 'heidi', email: 'heidi@example.com' },
      { username: 'ivan', email: 'ivan@example.com' },
      { username: 'judy', email: 'judy@example.com' },
    ];

    // Predefined post data
    const postsData = [
      { title: 'Exploring Node.js', content: 'Node.js is a versatile runtime for building backend applications.' },
      { title: 'Understanding REST APIs', content: 'REST APIs allow clients to communicate with servers using HTTP.' },
      { title: 'Intro to JWT Authentication', content: 'JWT is a secure way to transmit user information across systems.' },
      { title: 'What is Sequelize?', content: 'Sequelize is a Node.js ORM for interacting with relational databases.' },
      { title: 'React Basics', content: 'React is a powerful library for building dynamic web applications.' },
      { title: 'Frontend vs Backend', content: 'Understand the difference between frontend and backend development.' },
      { title: 'Mastering JavaScript', content: 'JavaScript is an essential language for web development.' },
      { title: 'Database Design 101', content: 'Database design is crucial for efficient data storage and retrieval.' },
      { title: 'APIs for Beginners', content: 'An API is a way for applications to communicate and share data.' },
      { title: 'Building Secure Applications', content: 'Security is paramount when building applications handling user data.' },
    ];

    // Predefined comments data
    const commentsData = [
      'Great post! Really helpful.',
      'I learned a lot from this article.',
      'Thank you for sharing this information.',
      'This clarifies so many concepts for me.',
      'I have a question about authentication...',
      'Can you explain more about API security?',
      'Fantastic breakdown of the topic.',
      'Looking forward to more posts like this.',
      'Is there a follow-up post?',
      'This is exactly what I was looking for.',
      'Thanks! I understand REST APIs better now.',
      'Sequelize seems powerful!',
      'Helpful overview on frontend vs backend.',
      'Could you share resources for JavaScript?',
      'The section on JWTs was very informative.',
    ];

    // Predefined categories data
    const categoriesData = [
      { name: 'Technology', description: 'All things related to technology' },
      { name: 'Web Development', description: 'Web development topics and tutorials' },
      { name: 'Security', description: 'Cybersecurity, authentication, and encryption' },
      { name: 'Databases', description: 'Topics related to relational and NoSQL databases' },
      { name: 'JavaScript', description: 'JavaScript tutorials, tips, and best practices' },
      { name: 'React', description: 'Everything about React and building frontend applications' },
      { name: 'Node.js', description: 'Server-side JavaScript with Node.js' },
      { name: 'APIs', description: 'Building and consuming APIs' },
      { name: 'Frontend', description: 'Frontend technologies and frameworks' },
      { name: 'Backend', description: 'Backend technologies and practices' },
    ];

    // Create Users
    const users = [];
    for (const userData of usersData) {
       const user = await db.User.create({
        ...userData,
        password: 'password',
      });
      users.push(user);
    }

    // Create Categories
    const categories = [];
    for (const categoryData of categoriesData) {
      const category = await db.Category.create(categoryData);
      categories.push(category);
    }

    // Create Posts
    const posts = [];
    for (const postData of postsData) {
      const post = await db.Post.create({
        ...postData,
        author_id: users[Math.floor(Math.random() * users.length)].user_id, // Randomly assign an author
        category_id: categories[Math.floor(Math.random() * categories.length)].category_id, // Randomly assign a category
      });
      posts.push(post);
    }

    // Create Comments
    for (const commentContent of commentsData) {
      await db.Comment.create({
        content: commentContent,
        post_id: posts[Math.floor(Math.random() * posts.length)].post_id, // Randomly assign a post
        author_id: users[Math.floor(Math.random() * users.length)].user_id, // Randomly assign a user
      });
    }

    console.log('Meaningful dummy data created successfully!');
  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    await db.sequelize.close();
  }
};


module.exports = seedData;
