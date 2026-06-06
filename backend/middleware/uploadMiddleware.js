const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

let storage;

// Check if Cloudinary credentials are fully configured in the environment
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  // Configure Cloudinary SDK
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Create Cloudinary Storage engine instance
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "placement_portal",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [
        { width: 1200, crop: "limit" }, // Resize down if width exceeds 1200px (keeps aspect ratio)
        { quality: "auto" },            // Auto-compression matching highest quality to smallest file size
        { fetch_format: "auto" }         // Serves optimized WebP or next-gen format depending on browser support
      ],
      public_id: (req, file) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const nameWithoutExt = path.parse(file.originalname).name;
        // Clean up file name from non-alphanumeric chars for Cloudinary public_id
        const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_");
        return `${cleanName}-${uniqueSuffix}`;
      }
    }
  });
  console.log("Cloudinary Storage Engine successfully configured.");
} else {
  // Fallback: Local disk storage
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  console.log("Cloudinary credentials missing in .env. Falling back to local Disk Storage.");
}

// Image file format constraints
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (jpg, jpeg, png, webp, gif) are allowed"), false);
  }
};

// Initialize multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size limit
  fileFilter: fileFilter
});

// Multer fields handler for job postings
const jobUpload = upload.fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 6 }
]);

module.exports = { jobUpload };
