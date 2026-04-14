const express = require('express');
const router  = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware  = require('../middleware/authMiddleware');
const postsController = require('../controllers/postsController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
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
router.post('/:id/like', postsController.toggleLike);
router.post('/:id/save', postsController.toggleSave);
router.post('/:id/comments', postsController.addComment);

module.exports = router;