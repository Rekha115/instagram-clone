import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Files are kept in memory and streamed straight to Cloudinary,
// so nothing ever touches the server's disk.
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPEG, PNG, and WEBP images are allowed.'), false);
  }
};

const mediaFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPEG, PNG, WEBP images or MP4/MOV videos are allowed.'), false);
  }
};

export const uploadProfilePicture = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('profilePicture');

export const uploadPostMedia = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB, accommodates short reels
}).array('media', 10);

export const uploadStoryMedia = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
}).single('media');
