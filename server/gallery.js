const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const upload = require('./upload');

const GALLERY_JSON = path.join(__dirname, '..', 'data', 'gallery.json');

// Get gallery list
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(GALLERY_JSON)) {
      fs.writeFileSync(GALLERY_JSON, '[]', 'utf8');
    }
    const data = JSON.parse(fs.readFileSync(GALLERY_JSON, 'utf8'));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read gallery data' });
  }
});

// Upload images to gallery
router.post('/upload', upload.array('gallery'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!fs.existsSync(GALLERY_JSON)) {
      fs.writeFileSync(GALLERY_JSON, '[]', 'utf8');
    }

    const currentGallery = JSON.parse(fs.readFileSync(GALLERY_JSON, 'utf8'));

    const newItems = req.files.map(file => ({
      image: `assets/gallery/${file.filename}`,
      title: 'New Gallery Item',
      desc: 'Add a description...'
    }));

    const updatedGallery = currentGallery.concat(newItems);
    fs.writeFileSync(GALLERY_JSON, JSON.stringify(updatedGallery, null, 2), 'utf8');

    res.json(updatedGallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload and save gallery items' });
  }
});

// Update the full gallery metadata (titles, descriptions, sorting order)
router.post('/update', (req, res) => {
  try {
    const updatedItems = req.body;
    if (!Array.isArray(updatedItems)) {
      return res.status(400).json({ error: 'Invalid gallery data format' });
    }
    fs.writeFileSync(GALLERY_JSON, JSON.stringify(updatedItems, null, 2), 'utf8');
    res.json(updatedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gallery content' });
  }
});

// Delete gallery item and its asset from disk
router.post('/delete', (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image path required for deletion' });
    }

    if (!fs.existsSync(GALLERY_JSON)) {
      return res.status(404).json({ error: 'Gallery store not found' });
    }

    let gallery = JSON.parse(fs.readFileSync(GALLERY_JSON, 'utf8'));
    gallery = gallery.filter(item => item.image !== image);
    fs.writeFileSync(GALLERY_JSON, JSON.stringify(gallery, null, 2), 'utf8');

    // Remove from disk
    const absolutePath = path.join(__dirname, '..', image);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    res.json(gallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

module.exports = router;
