// Dashboard controller

// Utility to show notification toast
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  if (type === 'error') {
    toast.style.background = '#ef4444';
    toast.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.3)';
  } else {
    toast.style.background = '#22c55e';
    toast.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.3)';
  }
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================================
// 1. CONFIG & FILE UPLOADS SECTION
// ==========================================
// Helper to convert file to Base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const configForm = document.getElementById('configForm');

async function loadConfig() {
  let data = null;
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      data = await res.json();
      localStorage.setItem('portfolioConfigCache', JSON.stringify(data));
    } else {
      throw new Error();
    }
  } catch (err) {
    console.log('Server config offline, loading from LocalStorage...');
    const stored = localStorage.getItem('portfolioData');
    const cache = localStorage.getItem('portfolioConfigCache');
    data = stored ? JSON.parse(stored) : (cache ? JSON.parse(cache) : {});
  }

  if (data) {
    document.getElementById('nameInput').value = data.name || '';
    document.getElementById('roleInput').value = data.role || '';
    document.getElementById('aboutInput').value = data.aboutText || data.desc || '';

    // Set previews
    const profilePreview = document.getElementById('profilePreview');
    const profileImgUrl = data.profileImage || data.profileImg;
    if (profileImgUrl) {
      const src = profileImgUrl.startsWith('data:') ? profileImgUrl : `/${profileImgUrl}`;
      profilePreview.innerHTML = `<img src="${src}" alt="Profile">`;
    } else {
      profilePreview.innerHTML = `<span style="font-size: 1.5rem">👤</span>`;
    }

    const resumePreview = document.getElementById('resumePreview');
    if (data.resumePdf) {
      const src = data.resumePdf.startsWith('data:') ? data.resumePdf : `/${data.resumePdf}`;
      resumePreview.innerHTML = `<a href="${src}" target="_blank" class="pdf-preview-link">📄 View Resume (PDF)</a>`;
    } else {
      resumePreview.innerHTML = `<span style="font-size: 1.5rem">📄</span>`;
    }
  }
}

// Handle text settings saving
configForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  let isOffline = false;
  let config = {};

  try {
    // Read current config first to keep existing file paths
    const currentRes = await fetch('/api/config');
    if (currentRes.ok) {
      config = await currentRes.json();
    } else {
      throw new Error();
    }
  } catch (err) {
    isOffline = true;
    const stored = localStorage.getItem('portfolioData');
    const cache = localStorage.getItem('portfolioConfigCache');
    config = stored ? JSON.parse(stored) : (cache ? JSON.parse(cache) : {});
  }

  config.name = document.getElementById('nameInput').value.trim();
  config.role = document.getElementById('roleInput').value.trim();
  config.aboutText = document.getElementById('aboutInput').value.trim();
  config.desc = config.aboutText; // sync keys

  if (!isOffline) {
    try {
      const saveRes = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (saveRes.ok) {
        showToast('Portfolio details saved successfully!');
        localStorage.setItem('portfolioConfigCache', JSON.stringify(config));
        return;
      }
    } catch (err) {
      console.log('Server save failed, saving locally...', err);
    }
  }

  // Local storage fallback
  localStorage.setItem('portfolioData', JSON.stringify(config));
  localStorage.setItem('portfolioConfigCache', JSON.stringify(config));
  showToast('Portfolio details saved locally in your browser!');
});

// Handle profile photo upload
document.getElementById('profileFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Attempt server upload
  const formData = new FormData();
  formData.append('profile', file);

  try {
    showToast('Uploading profile image...');
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        showToast('Profile image uploaded successfully!');
        loadConfig(); // Reload to update preview
        return;
      }
    }
  } catch (err) {
    console.log('Server image upload failed, saving locally instead...', err);
  }

  // Local storage fallback
  try {
    showToast('Local Mode: Encoding profile image...');
    const base64 = await fileToBase64(file);
    
    // Get current config
    const stored = localStorage.getItem('portfolioData');
    const cache = localStorage.getItem('portfolioConfigCache');
    const config = stored ? JSON.parse(stored) : (cache ? JSON.parse(cache) : {});
    
    config.profileImg = base64;
    config.profileImage = base64;
    
    localStorage.setItem('portfolioData', JSON.stringify(config));
    localStorage.setItem('portfolioConfigCache', JSON.stringify(config));
    
    showToast('Profile image updated locally!');
    loadConfig();
  } catch (err) {
    console.error(err);
    showToast('Failed to save profile image locally.', 'error');
  }
});

// Handle resume PDF upload
document.getElementById('resumeFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Attempt server upload
  const formData = new FormData();
  formData.append('resume', file);

  try {
    showToast('Uploading resume...');
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        showToast('Resume PDF uploaded successfully!');
        loadConfig(); // Reload to update link
        return;
      }
    }
  } catch (err) {
    console.log('Server resume upload failed, saving locally instead...', err);
  }

  // Local storage fallback
  try {
    showToast('Local Mode: Encoding resume PDF...');
    const base64 = await fileToBase64(file);
    
    // Get current config
    const stored = localStorage.getItem('portfolioData');
    const cache = localStorage.getItem('portfolioConfigCache');
    const config = stored ? JSON.parse(stored) : (cache ? JSON.parse(cache) : {});
    
    config.resumePdf = base64;
    
    localStorage.setItem('portfolioData', JSON.stringify(config));
    localStorage.setItem('portfolioConfigCache', JSON.stringify(config));
    
    showToast('Resume PDF saved locally!');
    loadConfig();
  } catch (err) {
    console.error(err);
    showToast('Failed to save resume PDF locally.', 'error');
  }
});


// ==========================================
// 2. DRAG AND DROP WORK GALLERY SECTION
// ==========================================
const dropZone = document.getElementById('dropZone');
const galleryFileInput = document.getElementById('galleryFileInput');
const galleryGrid = document.getElementById('galleryGrid');
const saveGalleryBtn = document.getElementById('saveGalleryBtn');

// Open file selector when clicking the dropzone
dropZone.addEventListener('click', () => galleryFileInput.click());

// File input selection handler
galleryFileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) uploadGalleryFiles(files);
});

// Drag and drop event handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (files.length > 0) uploadGalleryFiles(files);
});

// Upload images to backend
// Upload images to backend with LocalStorage fallback
async function uploadGalleryFiles(files) {
  // First attempt server-side upload
  const formData = new FormData();
  files.forEach(file => formData.append('gallery', file));

  try {
    showToast(`Uploading ${files.length} gallery image(s)...`);
    const res = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData
    });
    
    if (res.ok) {
      showToast('Gallery images uploaded! Fill in descriptions below.');
      loadGallery();
      return;
    }
  } catch (err) {
    console.log('Server upload failed, attempting local storage upload...', err);
  }

  // Local storage fallback
  try {
    showToast(`Local Mode: Processing ${files.length} image(s)...`);
    const localGalleryStr = localStorage.getItem('portfolioGallery') || '[]';
    const gallery = JSON.parse(localGalleryStr);
    
    for (const file of files) {
      const base64 = await fileToBase64(file);
      gallery.push({
        image: base64,
        title: 'New Gallery Item',
        desc: 'Add a description...'
      });
    }
    
    localStorage.setItem('portfolioGallery', JSON.stringify(gallery));
    showToast('Gallery images added locally! Save details below.');
    loadGallery();
  } catch (err) {
    console.error(err);
    showToast('Failed to save gallery images locally.', 'error');
  }
}

// Load current gallery from Server or LocalStorage
async function loadGallery() {
  let items = [];
  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      items = await res.json();
      localStorage.setItem('portfolioGalleryCache', JSON.stringify(items));
    } else {
      throw new Error();
    }
  } catch (err) {
    const localGallery = localStorage.getItem('portfolioGallery');
    const cachedGallery = localStorage.getItem('portfolioGalleryCache');
    items = localGallery ? JSON.parse(localGallery) : (cachedGallery ? JSON.parse(cachedGallery) : []);
  }
  
  galleryGrid.innerHTML = '';
  
  if (items.length === 0) {
    galleryGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 20px; border: 1px dashed var(--border); border-radius: var(--radius-sm)">No items in the gallery. Drag & drop images above to get started!</div>`;
    return;
  }

  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.dataset.projectId = item.id;
    
    const coverSrc = item.image.startsWith('data:') ? item.image : `/${item.image}`;
    
    // Category Selector options
    const categories = ["UI/UX Design", "Branding", "Graphic Design"];
    let catOptions = '';
    categories.forEach(cat => {
      catOptions += `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`;
    });

    // Render nested images list
    let imagesHtml = '';
    const imgList = item.images || [item.image];
    imgList.forEach(img => {
      const isrc = img.startsWith('data:') ? img : `/${img}`;
      imagesHtml += `
        <div style="position: relative; width: 50px; height: 50px; border-radius: 6px; border: 1px solid var(--border); overflow: hidden; background: #fafaf8;">
          <img src="${isrc}" style="width: 100%; height: 100%; object-fit: cover;" />
          <button type="button" class="btn-delete-img" data-img-path="${img}" style="position: absolute; top: 0; right: 0; background: rgba(239, 68, 68, 0.9); color: white; border: none; font-size: 0.78rem; border-radius: 0 0 0 6px; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; line-height: 1;">×</button>
        </div>
      `;
    });

    imagesHtml += `
      <label for="file-add-${item.id}" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--purple); border-radius: 6px; cursor: pointer; color: var(--purple); font-size: 1.2rem; background: var(--purple-soft); font-weight: 700; flex-shrink: 0; line-height: 1; transition: all 0.2s;">＋</label>
      <input type="file" id="file-add-${item.id}" data-project-id="${item.id}" class="project-image-add-input" accept="image/*" style="display: none;" />
    `;

    card.innerHTML = `
      <img src="${coverSrc}" alt="Cover Preview" />
      <div class="gallery-card-body">
        <div class="form-group" style="margin-bottom: 8px;">
          <label style="font-size: 0.68rem; margin-bottom: 2px;">Project Title</label>
          <input type="text" class="gallery-title" placeholder="Project Title" value="${item.title || ''}" style="padding: 8px 12px;" />
        </div>
        <div class="form-group" style="margin-bottom: 8px;">
          <label style="font-size: 0.68rem; margin-bottom: 2px;">Category</label>
          <select class="gallery-category" style="width: 100%; padding: 8px 12px; border: 1.5px solid var(--border); border-radius: var(--radius-sm); outline: none; font-size: 0.85rem; font-family: inherit; font-weight: 600; color: var(--text); background: white;">
            ${catOptions}
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 12px;">
          <label style="font-size: 0.68rem; margin-bottom: 2px;">Project Description</label>
          <textarea class="gallery-desc" placeholder="Project Description..." style="padding: 8px 12px; height: 60px;">${item.desc || ''}</textarea>
        </div>
        
        <label style="font-size: 0.68rem; margin-bottom: 4px; display: block; font-weight: 700; color: var(--text-muted);">PROJECT IMAGES (${imgList.length})</label>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; align-items: center;" class="project-images-container">
          ${imagesHtml}
        </div>

        <div class="gallery-card-actions" style="margin-top: auto; border-top: 1px solid var(--border); padding-top: 10px;">
          <button type="button" class="btn-danger delete-project-btn" style="padding: 6px 12px; font-size: 0.78rem;">🔴 Delete Project</button>
        </div>
      </div>
    `;

    // 1. Delete image from project listener
    card.querySelectorAll('.btn-delete-img').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const imgPath = btn.dataset.imgPath;
        deleteGalleryItem(imgPath, null);
      });
    });

    // 2. Add image to project file change listener
    card.querySelector('.project-image-add-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const pId = e.target.dataset.projectId;
      await uploadImageToProject(file, pId);
    });

    // 3. Delete full project listener
    card.querySelector('.delete-project-btn').addEventListener('click', () => {
      deleteGalleryItem(null, item.id);
    });
    
    galleryGrid.appendChild(card);
  });
}

// Upload file directly into a project
async function uploadImageToProject(file, projectId) {
  const formData = new FormData();
  formData.append('gallery', file);
  formData.append('projectId', projectId);

  try {
    showToast('Adding image to project...');
    const res = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData
    });
    
    if (res.ok) {
      showToast('Image added to project successfully!');
      loadGallery();
      return;
    }
  } catch (err) {
    console.log('Server upload failed, updating project image locally...', err);
  }

  // Local storage fallback
  try {
    showToast('Local Mode: Encoding image...');
    const base64 = await fileToBase64(file);
    const localGallery = JSON.parse(localStorage.getItem('portfolioGallery') || '[]');
    
    const project = localGallery.find(p => p.id === projectId);
    if (project) {
      project.images = (project.images || []).concat([base64]);
      if (!project.image) project.image = base64;
      localStorage.setItem('portfolioGallery', JSON.stringify(localGallery));
      showToast('Image added to project locally! Remember to save.');
      loadGallery();
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to add image locally.', 'error');
  }
}

// Delete item or project with LocalStorage fallback
async function deleteGalleryItem(imagePath, projectId) {
  const msg = projectId 
    ? 'Are you sure you want to delete this entire project and all its images?' 
    : 'Are you sure you want to delete this single image from the project?';
  
  if (!confirm(msg)) return;

  try {
    const res = await fetch('/api/gallery/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imagePath, projectId: projectId })
    });

    if (res.ok) {
      showToast('Deletion successful!');
      loadGallery();
      return;
    }
  } catch (err) {
    console.log('Server deletion failed, trying local deletion...', err);
  }

  // Offline deletion
  try {
    let localGallery = JSON.parse(localStorage.getItem('portfolioGallery') || '[]');
    
    if (projectId) {
      localGallery = localGallery.filter(p => p.id !== projectId);
    } else if (imagePath) {
      localGallery.forEach(p => {
        if (p.images && p.images.includes(imagePath)) {
          p.images = p.images.filter(img => img !== imagePath);
          if (p.image === imagePath) {
            p.image = p.images.length > 0 ? p.images[0] : '';
          }
        }
      });
      localGallery = localGallery.filter(p => p.images && p.images.length > 0);
    }
    
    localStorage.setItem('portfolioGallery', JSON.stringify(localGallery));
    localStorage.setItem('portfolioGalleryCache', JSON.stringify(localGallery));
    
    showToast('Deleted successfully from local storage!');
    loadGallery();
  } catch (err) {
    console.error(err);
    showToast('Failed to perform deletion locally.', 'error');
  }
}

// Save all gallery metadata (titles, descriptions, categories, images)
saveGalleryBtn.addEventListener('click', async () => {
  let items = [];
  try {
    const res = await fetch('/api/gallery');
    if (res.ok) {
      items = await res.json();
    }
  } catch (err) {
    items = JSON.parse(localStorage.getItem('portfolioGallery') || '[]');
  }

  const cards = Array.from(galleryGrid.querySelectorAll('.gallery-card'));
  const updatedData = cards.map(card => {
    const pId = card.dataset.projectId;
    const project = items.find(p => p.id === pId) || {};
    
    return {
      id: pId,
      title: card.querySelector('.gallery-title').value.trim(),
      category: card.querySelector('.gallery-category').value,
      desc: card.querySelector('.gallery-desc').value.trim(),
      image: project.image || '',
      images: project.images || []
    };
  });

  try {
    showToast('Saving gallery metadata...');
    const res = await fetch('/api/gallery/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    if (res.ok) {
      showToast('Gallery projects updated successfully! Refresh your portfolio site.');
      localStorage.setItem('portfolioGalleryCache', JSON.stringify(updatedData));
      return;
    }
  } catch (err) {
    console.log('Server save failed, saving locally instead...', err);
  }

  // Offline save
  try {
    localStorage.setItem('portfolioGallery', JSON.stringify(updatedData));
    localStorage.setItem('portfolioGalleryCache', JSON.stringify(updatedData));
    showToast('Gallery projects updated locally in your browser! Refresh your portfolio site.');
  } catch (err) {
    console.error(err);
    showToast('Failed to save gallery changes locally.', 'error');
  }
});

// ==========================================
// 3. INITIALIZATION ON LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  loadGallery();
});
