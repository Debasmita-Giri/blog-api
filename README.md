# **Blog API**

A backend API for a blog application providing CRUD operations for users, comments, posts, and categories. The API is secured with JWT authentication and role-based access control.

---

## **Table of Contents**
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Software Needed](#software-needed)
4. [Base URL](#base-url)
5. [Environment Variables](#environment-variables)
6. [Installation & Setup](#installation--setup)
7. [Testing the API with Postman](#testing-the-api-with-postman)
8. [Usage](#usage)
9. [Contributing](#contributing)
10. [License](#license)
11. [Future Enhancements](#future-enhancements)

---


## **Features**

- **User Management**: Create, update, delete, and retrieve user information.
- **Post Management**: Manage blog posts with CRUD operations.
- **Category Management**: Assign categories to posts and perform CRUD operations.
- **Comment System**: Add, view, edit, and delete comments on posts.
- **JWT Authentication**: Secure endpoints with token-based authentication.
- **Role-Based Access Control**: Restrict certain actions based on user roles.

---

## **Tech Stack**

- **Backend**: Node.js, Express.js
- **Database**: MySQL (via Sequelize ORM)

---

## **Software Needed**

To run and develop the Blog API, ensure you have the following software installed:

### **1. Node.js**  
- **Version**: 14.x or higher  
- **Download**: [Node.js Official Website](https://nodejs.org/)
- Node.js is required to run the server and install dependencies.


### **3. MySQL Database**  
- **Version**: 8.0  or higher  
- **Download**: [MySQL Official Website](https://dev.mysql.com/downloads/installer/)
- MySQL is used as the database for storing user, post, comment, and category data.

### **5. Postman (for API Testing)**  
- **Download**: [Postman Official Website](https://www.postman.com/downloads/)
- Postman is a tool for testing API endpoints and simulating HTTP requests.

### **6. Git**  
- **Version**: 2.x or higher  
- **Download**: [Git Official Website](https://git-scm.com/)
- Git is used for version control and managing the project's source code.

### **7. Code Editor**  
- **Recommended Editors**:  
  - [Visual Studio Code](https://code.visualstudio.com/)
  - [Sublime Text](https://www.sublimetext.com/)
  - [Atom](https://atom.io/)
- A code editor is needed for viewing and editing the project files.

## **Base URL**

All API endpoints are prefixed with:  
```
/api/
```

Example endpoints:  
- **User Operations**: `/api/user`  
- **Post Operations**: `/api/post`  
- **Category Operations**: `/api/category`  
- **Comment Operations**: `/api/comment`  

---

## **Environment Variables**

The application requires the following environment variables to be set up in a `.env` file:

```env
# Database configuration
DB_NAME=<your_database_name>
DB_USERNAME=<your_database_username>
DB_PASSWORD=<your_database_password>
DB_HOST=<your_database_host>  # e.g., localhost, remote server, or cloud DB

# Server configuration
PORT=<server_port>  # Default: 8080
NODE_ENV=development  # Set to 'production' in a live environment

# JWT Secret Key for token authentication
SECRET_KEY_JWT=<your_secret_key>  # Change this to a strong, unique secret key
```

Make sure to replace the placeholder values (`<your_database_name>`, `<your_database_username>`, etc.) with the actual values for your environment.

---

## **Installation & Setup**

1. **Ensure SQL Server is Running**  
   Make sure that your SQL server (MySQL) is running and that a database (e.g., `blog`) is created. If not, create the database manually or configure the connection in your `.env` file to match an existing database.

2. Clone the repository:  
   ```bash
   git clone https://github.com/yourusername/blog-api.git
   cd blog-api
   ```

3. Install dependencies:  
   ```bash
   npm install
   ```

4. Set up the environment variables:  
  - Create a `.env` file in the root directory and add the required variables (see above). Ensure the database credentials and database name (`DB_NAME`) are correct.

5. **Load Initial Data (Optional)**:  
   If you want to populate the database with initial data for testing or development:
   - Open the `index.js` file.
   - Find line 33, which contains the following line of code:
     ```javascript
     // await require('./scripts/seedData')();
     ```
   - Uncomment the line to run the script:
     ```javascript
     await require('./scripts/seedData')();
     ```  
   - Save the file and run the application.
   
   **Important**: After loading the initial data, be sure to **comment the line back** to avoid seeding the database with duplicate entries each time the server restarts:
   ```javascript
   // await require('./scripts/seedData')();

6. Run the application :  
   ```bash
   node index.js
   ```
   - This will start the server and automatically sync the database, as Sequelize will handle this on app startup.
     
---

## **Testing the API with Postman**

We have included a **Postman collection** for testing all API endpoints.

1. **Download the Postman Collection**:  
   Download the [Postman collection](https://www.postman.com/planetary-flare-685115/workspace/blog-api-postman-collection/collection/29626424-a9eb284c-e8b1-4c2f-833b-986d1aec42cd?action=share&creator=29626424) that contains all the API endpoints for the blog application.

2. **Import the Collection into Postman**:  
   - Open Postman.
   - Click on **Import** in the top-left corner.
   - Select the downloaded Postman collection file and click **Import**.

3. **Use the Collection to Test the API**:  
   - The collection includes detailed documentation for each endpoint, including sample requests and responses.
   - The authentication endpoints (login, registration) require you to pass a valid JWT token in the `Authorization` header for protected routes.
     
4. **Set Up Postman Environment Variables**  
   In Postman, following variables already added for easier testing:
   - `base_url`: The base URL of your API. Ensure the base URL is set to `http://localhost:8080/api/` or the appropriate URL depending on your environment. You can modify the `base_url` variable in Postman to adjust this.
   - `jwtToken`: The `jwtToken` variable is already added in the collection. Once you log in, it will automatically set the JWT token in the `Authorization` header for all subsequent requests.

---

## **Usage**

### **Endpoints**
All endpoints are prefixed with `/api/`. Refer to the [Postman Collection](link-to-postman-collection) for detailed documentation of each endpoint, including sample requests and responses.

#### **Key Endpoints**:
- **User Management**: `/api/user`  
- **Post Management**: `/api/post`  
- **Category Management**: `/api/category`  
- **Comment System**: `/api/comment`

#### **Authentication**:
1. **Register**  
   First, register a new user by sending a `POST` request to `/api/user` with the required user details (e.g., `name`, `email`, `password`).

   Example:
   ```json
   POST /api/user
   {
     "name": "John Doe",
     "email": "johndoe@example.com",
     "password": "yourPassword"
   }
   ```

2. **Login**  
   After registering, log in using the `/api/user/login` endpoint. This will generate a JWT token for authentication.

   Example:
   ```json
   POST /api/user/login
   {
     "email": "johndoe@example.com",
     "password": "yourPassword"
   }
   ```

3. **Use the JWT Token for Protected Endpoints**    
After logging in, the JWT token will be stored in the `jwtToken` Postman variable. If the token expires, you will need to log in again to generate a new token. Postman will automatically use the token from the `Authorization` header for all subsequent requests. If the token is expired, you will receive a `401 Unauthorized` response.

---

## **Contributing**

1. Fork the repository.
2. Create a feature branch:  
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:  
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:  
   ```bash
   git push origin feature-name
   ```
5. Create a pull request.

---

## **License**

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## **Future Enhancements**

- Pagination for posts and comments.
- User profiles and profile picture uploads.
- Advanced search functionality.
- Rate limiting to prevent abuse of API endpoints.
- Enhanced input validation and error handling.

