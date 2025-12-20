import express from 'express';
import multer from 'multer';
import { isAuth } from '../Middleware/IsAuth.js';

import { deleteStoryItem, getActiveStories, getAllStories, uploadStory } from '../Controllers/storyUpload.js';

const StoryRouter = express.Router();

const storage = multer.memoryStorage(); // Use memory storage for Cloudinary

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not supported!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: fileFilter
});

// Upload reel (supports both images and videos)
StoryRouter.post('/uploadstory/:userId', upload.single('file'), uploadStory);
//  get active story 
StoryRouter.get('/storyActive/:userId', getActiveStories);    //done

//
StoryRouter.get('/storyAll/:userId' , getAllStories);

// Delete story
StoryRouter.delete("/deleteItem/:storyId/:itemId", deleteStoryItem);


export default StoryRouter;