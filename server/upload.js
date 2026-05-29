const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = path.join(__dirname, '..', 'assets');
    if (file.fieldname === 'profile') {
      dest = path.join(dest, 'hero');
    } else if (file.fieldname === 'resume') {
      dest = path.join(dest, 'resume');
    } else if (file.fieldname === 'gallery') {
      dest = path.join(dest, 'gallery');
    }
    
    // Dynamically create folder if it does not exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = upload;
