const express = require('express');
const router  = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware  = require('../middleware/authMiddleware');
const postsController = require('../controllers/postsController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create uploads directory on demand to avoid ENOENT errors.
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image provided.' });
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

router.get('/saved', postsController.getSaved);
router.get('/', postsController.getFeed);
router.get('/:id', postsController.getPost);
router.post('/', postsController.createPost);
router.patch('/:id', postsController.editPost);
router.delete('/:id', postsController.deletePost);
router.post('/:id/like', postsController.toggleLike);
router.post('/:id/save', postsController.toggleSave);
router.post('/:id/comments', postsController.addComment);
router.post('/:id/report', postsController.reportPost);

module.exports = router;