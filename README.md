# 🏫 CampusMart API

## Overview
CampusMart is a Node.js and Express.js powered RESTful API backend for a campus-based marketplace. It allows students to register, log in, and manage item listings for sale or exchange. It uses MongoDB for data storage, JWT for session management, and Multer for image uploads.

## Features
- **User Authentication**: Secure registration and login with JWT-based sessions.
- **Product Listings**: Add, read, update, and delete item listings.
- **Protected Routes**: Only accessible to authenticated users.
- **Image Upload**: Upload product images using `Multer`.
- **Password Security**: Hashed passwords using `bcryptjs`.
- **Scalable Design**: Modular controllers, routes, and models.

## Project Structure
```
CampusMart-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── listingController.js
├── models/
│   ├── User.js
│   └── Listing.js
├── routes/
│   ├── authRoutes.js
│   └── listingRoutes.js
├── uploads/                 # Stores uploaded images
├── .env
├── .gitignore
├── server.js
├── package.json
└── README.md
```

## Technologies Used
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: `bcryptjs`
- **File Uploads**: `Multer`
- **Environment Configuration**: `dotenv`

## Installation

### Prerequisites
- Node.js (https://nodejs.org/)
- MongoDB (https://www.mongodb.com/ or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rohitk2081/CampusMart-backend.git
   cd CampusMart-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file**:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   Or use `nodemon` during development:
   ```bash
   npx nodemon server.js
   ```

5. **Server Confirmation**:
   ```
   Server is running on port 5000
   MongoDB connected successfully
   ```

## API Endpoints

### Authentication Routes
- **POST `/api/auth/register`** – Register a new user
  ```json
  {
    "username": "rohit123",
    "email": "rohit@example.com",
    "password": "yourPassword"
  }
  ```

- **POST `/api/auth/login`** – Login and receive a JWT token
  ```json
  {
    "email": "rohit@example.com",
    "password": "yourPassword"
  }
  ```

### Listing Routes (Protected)
- **POST `/api/listings`** – Create a new product listing  
  - **Headers**: `Authorization: Bearer <token>`  
  - **Body (form-data)**:  
    - `title`, `description`, `price`, `category`, `location`, `file` (image)

- **GET `/api/listings`** – Get all listings

- **GET `/api/listings/:id`** – Get a specific listing by ID

- **PUT `/api/listings/:id`** – Update listing by ID  
  - **Headers**: `Authorization: Bearer <token>`  
  - **Body (form-data)**: fields to update

- **DELETE `/api/listings/:id`** – Delete listing  
  - **Headers**: `Authorization: Bearer <token>`

## Usage
1. Register using `/api/auth/register`.
2. Login at `/api/auth/login` to receive a JWT token.
3. Use that token in `Authorization` header for listing-related actions:
   ```
   Authorization: Bearer your_jwt_token
   ```

## Error Codes
- **400**: Bad Request – Validation or missing fields.
- **401**: Unauthorized – Token missing or invalid.
- **404**: Not Found – Resource not found.
- **500**: Server Error – Internal application error.

## Future Enhancements
- Add search and filter capabilities for listings.
- Implement pagination for large data sets.
- Chat system between buyers and sellers.
- Admin dashboard for moderation.
- Google OAuth Login.
- Swagger or Postman documentation.

## Contributing
1. Fork this repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request.


## Contact
**Author**: [Rohit Kumar](https://github.com/Rohitk2081)

For questions or feedback, open an issue or contact me directly.
