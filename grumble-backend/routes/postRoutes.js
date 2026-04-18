const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const postsController = require("../controllers/postsController");
const { uploadImage } = require("../services/supabaseStorageService");

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authMiddleware);

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided." });
    }

    // Upload to Supabase Storage
    const { url } = await uploadImage(req.file.buffer, req.file.originalname);
    res.json({ imageUrl: url });
  } catch (error) {
    console.error("Upload endpoint error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.get("/saved", postsController.getSaved);
router.get("/liked", postsController.getLiked);
router.get("/", postsController.getFeed);
router.get("/:id", postsController.getPost);
router.post("/", postsController.createPost);
router.patch("/:id", postsController.editPost);
router.delete("/:id", postsController.deletePost);
router.post("/:id/like", postsController.toggleLike);
router.post("/:id/save", postsController.toggleSave);
router.post("/:id/comments", postsController.addComment);
router.post("/:id/report", postsController.reportPost);

module.exports = router;
