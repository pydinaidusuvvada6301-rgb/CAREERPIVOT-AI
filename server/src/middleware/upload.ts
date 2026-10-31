import multer from 'multer';

const storage = multer.memoryStorage();

const allowedMimes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a PDF (.pdf), Word document (.docx), or Text file (.txt).'));
    }
  },
});
