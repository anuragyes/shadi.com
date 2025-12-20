import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  checkStatusOnline,
  deleteProfileImage,
  GetAllUser,
  GetUser,
  getUserById,
  Login,
  updateUserProfile,
  uploadProfileImage,
  UserLogout,
  UserSignup
} from '../Controllers/UserController.js';
import { isAuth } from '../Middleware/IsAuth.js';

const Userrouter = express.Router();

// ======== ENSURE UPLOAD FOLDER EXISTS ========
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ======== MULTER CONFIGURATION ========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname)); // e.g. 16983423232-12345678.jpg
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpeg|jpg|png|webp)$/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// ======== ROUTES ========

// ✅ Public routes
Userrouter.post('/signup', UserSignup);
Userrouter.post('/login', Login);
Userrouter.get('/all-users/:id', GetAllUser); // changed for consistency
Userrouter.get('/:id', getUserById);

// ✅ Protected routes
Userrouter.get('/me', isAuth, GetUser);
Userrouter.put('/update', isAuth, updateUserProfile);
Userrouter.post('/logout', isAuth, UserLogout);

// check user is online or not 

Userrouter.get("/active/:id", checkStatusOnline);



Userrouter.post(
  '/upload-profile-image',
  (req, res, next) => {
    upload.single('image')(req, res, function (err) {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  uploadProfileImage
);

Userrouter.delete('/delete-profile-image', isAuth, deleteProfileImage);

export default Userrouter;
