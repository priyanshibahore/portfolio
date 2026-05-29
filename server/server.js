const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const upload = require('./upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets & frontend files
app.use(express.static(path.join(__dirname, '..')));

// Config paths
const CONFIG_JSON = path.join(__dirname, '..', 'data', 'config.json');

// Ensure data folder exists
const dataDir = path.dirname(CONFIG_JSON);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// GET config API
app.get('/api/config', (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_JSON)) {
      const defaultConfig = {
        siteTitle: "Priyanshi Bahore – UI/UX & Graphic Designer",
        name: "Priyanshi Bahore",
        role: "UI/UX & Graphic Designer",
        profileImage: "assets/hero/priyanshi-profile.png",
        resumePdf: "assets/resume/priyanshi-resume.pdf",
        aboutText: "I design intuitive digital experiences and impactful visual identities that help brands connect, engage and grow."
      };
      fs.writeFileSync(CONFIG_JSON, JSON.stringify(defaultConfig, null, 2), 'utf8');
    }
    const data = JSON.parse(fs.readFileSync(CONFIG_JSON, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read config data' });
  }
});

// POST config API
app.post('/api/config', (req, res) => {
  try {
    const updatedConfig = req.body;
    fs.writeFileSync(CONFIG_JSON, JSON.stringify(updatedConfig, null, 2), 'utf8');
    res.json(updatedConfig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update config data' });
  }
});

// POST dynamic file uploads (profile picture or resume PDF)
app.post('/api/upload', upload.fields([
  { name: 'profile', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), (req, res) => {
  try {
    if (!fs.existsSync(CONFIG_JSON)) {
      return res.status(500).json({ error: 'Config not loaded yet' });
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_JSON, 'utf8'));
    const responseData = {};

    if (req.files['profile']) {
      const profileFile = req.files['profile'][0];
      config.profileImage = `assets/hero/${profileFile.filename}`;
      responseData.profileImage = config.profileImage;
    }

    if (req.files['resume']) {
      const resumeFile = req.files['resume'][0];
      config.resumePdf = `assets/resume/${resumeFile.filename}`;
      responseData.resumePdf = config.resumePdf;
    }

    fs.writeFileSync(CONFIG_JSON, JSON.stringify(config, null, 2), 'utf8');
    res.json({ success: true, ...responseData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload files and update config' });
  }
});

// Mount Gallery Router
app.use('/api/gallery', require('./gallery'));

// Mount Contact Form Router
app.use('/api/contact', require('./contact'));

// Route to serve the admin preview/editor directly when accessing /admin or /admin/
app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'admin.html'));
});

// Fallback to serve index.html for undefined frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`PORTFOLIO SERVER RUNNING`);
  console.log(`- Main Portfolio: http://localhost:${PORT}`);
  console.log(`- Admin Dashboard: http://localhost:${PORT}/admin/admin.html`);
  console.log(`=========================================`);
});
