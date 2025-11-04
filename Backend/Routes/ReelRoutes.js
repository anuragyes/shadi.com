import express from 'express';
import multer from 'multer';
import { isAuth } from '../Middleware/IsAuth.js';
import { 
  uploader, 
  getAllReels, 
  getReels, 
  likeUnlikeReel,
  deleteReel 
} from '../Controllers/ReelController.js';

const ReelRouter = express.Router();

// Configure multer for memory storage (for direct Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow both video and image files
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed!'), false);
    }
  }
});

// Upload reel (supports both images and videos)
ReelRouter.post('/upload', upload.single('media'), uploader);

// Get all reels (with pagination and filtering)
ReelRouter.get('/AllReels', isAuth, getAllReels);

// Get reels by user
ReelRouter.get('/my-reels/:id', isAuth, getReels);

// Like/Unlike reel
ReelRouter.post('/:id/like', isAuth, likeUnlikeReel);

// Delete reel
ReelRouter.delete('/deleteReel', isAuth, deleteReel);

export default ReelRouter;