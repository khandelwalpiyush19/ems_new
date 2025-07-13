

---

# EMS Portal (Employee Management System)

## 📝 Project Description

An Employee Management System (EMS) portal built using the MERN stack (MongoDB, Express.js, React, Node.js). The project features:

- **Frontend**: Built with Vite + React, using Redux and Context API for state management
- **Styling**: Material UI components with Tailwind CSS for custom styling
- **Backend**: Node.js with Express.js framework and Mongoose for MongoDB operations
- **Authentication**: JWT-based secure authentication system
- **Email Service**: Integrated email (nodemailer) functionality for system notifications

## 📁 Project Structure

```
ems-portal/
├── vite_client/                  # Frontend application
│   ├── src/
│   │   ├── components/           # React components organized by feature
│   │   ├── constants/            # Application constants (including API endpoints)
│   │   └── ...                   # Other frontend source files
│
└── server/                       # Backend application (MVC structure)
    ├── controllers/              # Business logic separated by feature
    ├── models/                   # MongoDB schema definitions
    ├── routes/                   # API endpoints
    ├── middlewares/              # Custom middleware functions
    ├── helpers/                  # Utility functions
    ├── db/                       # Database connection setup
    └── ...
```

## 🔐 Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.lxwkmke.mongodb.net/EMS?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_secure_jwt_secret_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email Configuration (Gmail example)
EMAIL_SERVICE=Gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
```

**Important Notes:**
1. Replace all credentials with your own
2. For Gmail, you may need to generate an App-Specific Password if 2FA is enabled
3. The current MongoDB URI contains sample credentials - **must be changed before deployment**

## 🚀 Setup Instructions

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd vite_client
   npm install
   npm run dev
   ```

## ✅ Key Features

- Admin registration (can be disabled by commenting line 71 in `vite_client/src/App.jsx`)
- Centralized API endpoints configuration in `vite_client/src/utils/constants`
- Modular MVC architecture for easy maintenance
- Responsive UI with both Material UI and Tailwind CSS

## ⚠️ Deployment Notes

1. Update all API endpoints in `vite_client/src/constants`
2. Ensure all sensitive credentials are properly secured
3. Set `NODE_ENV=production` in production environment
4. Configure proper CORS settings for production

---
