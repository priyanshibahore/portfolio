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

// Upload images (new project or additions to existing project)
router.post('/upload', upload.array('gallery'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!fs.existsSync(GALLERY_JSON)) {
      fs.writeFileSync(GALLERY_JSON, '[]', 'utf8');
    }

    const currentGallery = JSON.parse(fs.readFileSync(GALLERY_JSON, 'utf8'));
    const { projectId } = req.body;
    const filePaths = req.files.map(file => `assets/gallery/${file.filename}`);

    if (projectId) {
      // Add files to an existing project!
      const project = currentGallery.find(p => p.id === projectId);
      if (project) {
        project.images = (project.images || []).concat(filePaths);
        // If the project doesn't have a cover image, set the first uploaded file as cover
        if (!project.image && project.images.length > 0) {
          project.image = project.images[0];
        }
      } else {
        return res.status(404).json({ error: 'Project not found' });
      }
    } else {
      // Create a brand new project!
      const uniqueId = 'proj-' + Date.now();
      const newProject = {
        id: uniqueId,
        title: 'New Project',
        desc: 'Add a description...',
        category: 'Branding',
        image: filePaths[0],
        images: filePaths
      };
      currentGallery.push(newProject);
    }

    fs.writeFileSync(GALLERY_JSON, JSON.stringify(currentGallery, null, 2), 'utf8');
    res.json(currentGallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload and save gallery items' });
  }
});

// Update the full gallery metadata (titles, descriptions, categories)
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

// Delete gallery item or whole project and assets from disk
router.post('/delete', (req, res) => {
  try {
    const { image, projectId } = req.body;
    if (!image && !projectId) {
      return res.status(400).json({ error: 'Image path or Project ID required for deletion' });
    }

    if (!fs.existsSync(GALLERY_JSON)) {
      return res.status(404).json({ error: 'Gallery store not found' });
    }

    let gallery = JSON.parse(fs.readFileSync(GALLERY_JSON, 'utf8'));

    if (projectId && !image) {
      // Delete the entire project and all its images from disk!
      const project = gallery.find(p => p.id === projectId);
      if (project) {
        (project.images || []).forEach(img => {
          const absolutePath = path.join(__dirname, '..', img);
          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
          }
        });
      }
      gallery = gallery.filter(p => p.id !== projectId);
    } else if (image) {
      // Delete a single image from a project!
      gallery.forEach(project => {
        if (project.images && project.images.includes(image)) {
          project.images = project.images.filter(img => img !== image);
          // If the deleted image was the cover image, update it to the next available image
          if (project.image === image) {
            project.image = project.images.length > 0 ? project.images[0] : '';
          }
        }
      });
      // Filter out any projects that no longer have any images left!
      gallery = gallery.filter(project => project.images && project.images.length > 0);

      // Remove file from disk
      const absolutePath = path.join(__dirname, '..', image);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    fs.writeFileSync(GALLERY_JSON, JSON.stringify(gallery, null, 2), 'utf8');
    res.json(gallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

module.exports = router;
