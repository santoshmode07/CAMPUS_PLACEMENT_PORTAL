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

// Disk storage specifically for Job Description (JD) PDF files
const diskStorageForJd = multer.diskStorage({
  destination: function (req, file, cb) {
    const jdDir = path.join(__dirname, "../uploads/jds");
    if (!fs.existsSync(jdDir)) {
      fs.mkdirSync(jdDir, { recursive: true });
    }
    cb(null, jdDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Composite storage routing files based on fieldname
const jobStorage = {
  _handleFile(req, file, cb) {
    if (file.fieldname === "jdPdf") {
      diskStorageForJd._handleFile(req, file, cb);
    } else {
      storage._handleFile(req, file, cb);
    }
  },
  _removeFile(req, file, cb) {
    if (file.fieldname === "jdPdf") {
      diskStorageForJd._removeFile(req, file, cb);
    } else {
      storage._removeFile(req, file, cb);
    }
  }
};

// Custom file filter for jobs to support both images and JD PDFs
const jobFileFilter = (req, file, cb) => {
  if (file.fieldname === "jdPdf") {
    const extname = path.extname(file.originalname).toLowerCase() === ".pdf";
    const mimetype = file.mimetype === "application/pdf";
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only PDF files (.pdf) are allowed for Job Description (JD)"), false);
    }
  } else {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error("Only images (jpg, jpeg, png, webp, gif) are allowed for banners and gallery"), false);
    }
  }
};

// Initialize multer instance for jobs
const jobMulter = multer({
  storage: jobStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max size limit for job uploads
  fileFilter: jobFileFilter
});

// Multer fields handler for job postings (supporting images and the PDF JD)
const jobUpload = jobMulter.fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 6 },
  { name: "jdPdf", maxCount: 1 }
]);

// Resume storage configuration: Store resumes locally on disk to prevent Cloudinary account ACL restrictions for raw PDF delivery
const resumeUploadDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(resumeUploadDir)) {
  fs.mkdirSync(resumeUploadDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumeUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// PDF specific file filter
const resumeFileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname).toLowerCase() === ".pdf";
  const mimetype = file.mimetype === "application/pdf";

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF files (.pdf) are allowed for resumes"), false);
  }
};

// Initialize multer for resume upload
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: resumeFileFilter
}).single("resume");

module.exports = { jobUpload, resumeUpload };
