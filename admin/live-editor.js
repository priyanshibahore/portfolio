// Priyanshi Bahore Portfolio - Visual Live Editor Controller
// Injected when editing is activated

let isEditMode = false;
let originalData = null;

// Inject custom editor styles dynamically to keep index.html clean!
const style = document.createElement('style');
style.innerHTML = `
  /* Visual Customizer Styles */
  .edit-outline {
    position: relative;
    outline: 1px dashed var(--purple-light) !important;
    cursor: text !important;
    transition: all 0.2s;
  }
  .edit-outline:hover {
    outline: 2px solid var(--purple) !important;
    background: rgba(123, 94, 167, 0.05) !important;
    box-shadow: 0 0 10px rgba(123, 94, 167, 0.1) !important;
  }
  
  .image-edit-container {
    position: relative;
  }
  
  .image-edit-overlay {
    position: absolute;
    inset: 0;
    background: rgba(15, 15, 20, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
    z-index: 100;
  }
  
  .image-edit-container:hover .image-edit-overlay {
    opacity: 1;
  }
  
  .btn-upload-overlay {
    background: var(--purple);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(123, 94, 167, 0.3);
    transition: transform 0.2s;
  }
  
  .btn-upload-overlay:hover {
    transform: scale(1.05);
    background: var(--purple-dark);
  }

  /* Live Editor Control Panels */
  .live-editor-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: rgba(15, 15, 20, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid var(--purple);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    color: white;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    transform: translateY(-80px);
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .live-editor-bar.show {
    transform: translateY(0);
  }
  
  .editor-title {
    font-family: 'Orbitron', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    letter-spacing: 0.05em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .editor-actions {
    display: flex;
    gap: 12px;
  }
  
  .btn-editor-save {
    background: #22c55e;
    color: white;
    border: none;
    padding: 8px 18px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.85rem;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  }
  
  .btn-editor-cancel {
    background: transparent;
    color: #ef4444;
    border: 1.5px solid #ef4444;
    padding: 7px 16px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    font-size: 0.85rem;
  }
  
  .btn-editor-save:hover {
    background: #16a34a;
  }
  
  .btn-editor-cancel:hover {
    background: rgba(239, 68, 68, 0.08);
  }

  /* Floating trigger button */
  .floating-edit-trigger {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1.5px solid rgba(123, 94, 167, 0.25);
    border-radius: 50px;
    padding: 12px 24px;
    font-weight: 700;
    color: var(--purple-dark);
    box-shadow: var(--shadow);
    cursor: pointer;
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.88rem;
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  
  .floating-edit-trigger:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    background: white;
    border-color: var(--purple);
  }
  
  .floating-edit-trigger.active {
    background: var(--purple);
    color: white;
    border-color: var(--purple-dark);
  }
`;
document.head.appendChild(style);

// Create editor bar
const editorBar = document.createElement('div');
editorBar.className = 'live-editor-bar';
editorBar.id = 'liveEditorBar';
editorBar.innerHTML = `
  <div class="editor-title" style="display: flex; align-items: center; gap: 16px;">
    <div><span style="font-size: 1.2rem;">🛠️</span> VISUAL LIVE EDITOR</div>
    <div style="display: flex; align-items: center; gap: 8px; font-family: inherit; font-size: 0.85rem;">
      <label for="themeColorSelect" style="color: var(--purple-light); font-weight: 700; cursor: pointer;">Theme Style:</label>
      <select id="themeColorSelect" style="background: #181820; color: white; border: 1.5px solid var(--purple-light); padding: 5px 10px; border-radius: 7px; font-weight: 600; cursor: pointer; outline: none; font-size: 0.82rem; transition: border-color 0.2s;">
        <option value="purple">💜 Purple (Default)</option>
        <option value="blue">💙 Ocean Blue</option>
        <option value="green">💚 Emerald Green</option>
        <option value="orange">🧡 Sunset Orange</option>
        <option value="red">❤️ Crimson Red</option>
      </select>
    </div>
  </div>
  <div class="editor-actions" style="display: flex; gap: 10px; align-items: center;">
    <a href="admin/panel.html" class="btn-editor-cancel" style="border-color: var(--purple-light); color: var(--purple-light); text-decoration: none; padding: 8px 16px; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.85rem; border-radius: 8px; transition: all 0.2s;">📂 Project Dashboard</a>
    <button class="btn-editor-cancel" id="btnEditorCancel">❌ Revert</button>
    <button class="btn-editor-save" id="btnEditorSave">💾 Save Live Changes</button>
  </div>
`;
document.body.appendChild(editorBar);

// Bind theme switcher select dropdown
editorBar.querySelector('#themeColorSelect').addEventListener('change', (e) => {
  if (typeof applyAccentTheme === 'function') {
    applyAccentTheme(e.target.value);
  }
});

// Create trigger button
const triggerBtn = document.createElement('button');
triggerBtn.className = 'floating-edit-trigger';
triggerBtn.id = 'floatingEditTrigger';
triggerBtn.innerHTML = `✏️ Edit Page Content`;
document.body.appendChild(triggerBtn);

// ==========================================
// VISUAL CUSTOMIZER ENGINE
// ==========================================

// Toggle edit mode
triggerBtn.addEventListener('click', () => {
  isEditMode = !isEditMode;
  
  if (isEditMode) {
    activateEditMode();
  } else {
    deactivateEditMode(false);
  }
});

// Activating local contentEditable and bindings
function activateEditMode() {
  if (window.isAdminEditor) {
    if (triggerBtn) triggerBtn.style.display = 'none';
  } else {
    triggerBtn.classList.add('active');
    triggerBtn.innerHTML = `🛡️ Close Editor`;
  }
  editorBar.classList.add('show');
  
  // Make texts editable
  const textSelectors = [
    '.hero-name',
    '.hero-role',
    '.hero-desc',
    '.hero-tag-text',
    '.hero-avail span',
    '.hero-btns .btn-primary',
    '.hero-btns .btn-outline',
    '.btn-resume',
    '.nav-badge',
    '.nav-links a',
    '.case-title',
    '.case-tag',
    '.case-desc',
    '.case-num',
    '.tl-dot',
    '.tl-co',
    '.tl-role',
    '.tl-period',
    '.tl-desc',
    '.skill-ico',
    '.skill-name',
    '.skill-sub',
    '.skill-pct',
    '.p-icon',
    '.p-num',
    '.p-name',
    '.p-desc',
    '.sec-title',
    '.sec-label',
    '.c-lbl',
    '.c-val',
    '.g-title',
    '.g-desc',
    'footer span'
  ];
  
  textSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.contentEditable = 'true';
      el.classList.add('edit-outline');
    });
  });

  // Inject Profile Picture edit overlay
  const photoCircle = document.querySelector('.photo-circle');
  if (photoCircle) {
    photoCircle.classList.add('image-edit-container');
    const overlay = document.createElement('div');
    overlay.className = 'image-edit-overlay';
    overlay.innerHTML = `<button class="btn-upload-overlay" id="btnProfileUpload">📷 Upload Photo</button>`;
    photoCircle.appendChild(overlay);
    
    // Bind click to file upload
    document.getElementById('btnProfileUpload').addEventListener('click', (e) => {
      e.stopPropagation();
      openImageUploader('profile');
    });
  }

  // Inject Case Study Mockup edit overlays
  document.querySelectorAll('.cases-grid .case-card').forEach((card, idx) => {
    const imgInner = card.querySelector('.case-img-inner');
    if (imgInner) {
      imgInner.classList.add('image-edit-container');
      const overlay = document.createElement('div');
      overlay.className = 'image-edit-overlay';
      overlay.innerHTML = `<button class="btn-upload-overlay btn-case-upload" data-idx="${idx}">📷 Change Mockup</button>`;
      imgInner.appendChild(overlay);
      
      overlay.querySelector('.btn-case-upload').addEventListener('click', (e) => {
        e.stopPropagation();
        openImageUploader('case', idx);
      });
    }
  });

  // Inject Gallery Image overlays
  document.querySelectorAll('.gallery-grid .case-card').forEach((card, idx) => {
    const imgInner = card.querySelector('.case-img-inner');
    if (imgInner) {
      imgInner.classList.add('image-edit-container');
      const overlay = document.createElement('div');
      overlay.className = 'image-edit-overlay';
      overlay.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
          <button class="btn-upload-overlay btn-gallery-upload" data-idx="${idx}">📷 Change Pic</button>
        </div>
      `;
      imgInner.appendChild(overlay);
      
      overlay.querySelector('.btn-gallery-upload').addEventListener('click', (e) => {
        e.stopPropagation();
        openImageUploader('gallery', idx);
      });
    }
  });



  showToastBanner('Visual Edit Mode active! Click on any text, type your edits, and hit Save.');
}

// Helper to convert file to Base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Open file selector helper
function openImageUploader(type, index = null) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    if (type === 'profile') {
      formData.append('profile', file);
      showToastBanner('Uploading profile photo...');
      
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            showToastBanner('Profile photo updated in place!');
            const img = document.querySelector('.photo-circle img');
            if (img) img.src = data.profileImage;
            return;
          }
        }
      } catch (err) {
        console.log('Server upload failed, updating profile photo locally...', err);
      }

      // Local storage fallback
      try {
        const base64 = await fileToBase64(file);
        const img = document.querySelector('.photo-circle img');
        if (img) img.src = base64;
        else {
          document.querySelector('.photo-circle').innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;object-position:top center;">`;
        }
        showToastBanner('Profile photo updated locally! Remember to click Save.');
      } catch (err) {
        console.error(err);
        showToastBanner('Failed to process image locally.', 'error');
      }

    } else if (type === 'case') {
      // Local image encoding fallback
      try {
        showToastBanner('Processing mockup image...');
        const base64 = await fileToBase64(file);
        const card = document.querySelectorAll('.cases-grid .case-card')[index];
        const imgInner = card.querySelector('.case-img-inner');
        if (imgInner) {
          imgInner.innerHTML = `<img src="${base64}" alt="Case Mockup" style="width:100%;height:100%;object-fit:cover;display:block;">`;
          // Re-attach overlays since we rewrote innerHTML
          imgInner.classList.add('image-edit-container');
          const overlay = document.createElement('div');
          overlay.className = 'image-edit-overlay';
          overlay.innerHTML = `<button class="btn-upload-overlay btn-case-upload" data-idx="${index}">📷 Change Mockup</button>`;
          imgInner.appendChild(overlay);
          overlay.querySelector('.btn-case-upload').addEventListener('click', (ev) => {
            ev.stopPropagation();
            openImageUploader('case', index);
          });
        }
        showToastBanner('Mockup image updated! Remember to click Save.');
      } catch (err) {
        console.error(err);
        showToastBanner('Failed to process image locally.', 'error');
      }

    } else if (type === 'gallery') {
      formData.append('gallery', file);
      showToastBanner('Uploading gallery image...');
      
      try {
        const res = await fetch('/api/gallery/upload', { method: 'POST', body: formData });
        if (res.ok) {
          showToastBanner('Gallery image uploaded! Refreshing gallery...');
          location.reload();
          return;
        }
      } catch (err) {
        console.log('Server upload failed, adding to local gallery...', err);
      }

      // Local storage fallback
      try {
        const base64 = await fileToBase64(file);
        const localGalleryStr = localStorage.getItem('portfolioGallery') || '[]';
        const gallery = JSON.parse(localGalleryStr);
        gallery.push({
          image: base64,
          title: 'New Visual Item',
          desc: 'Edit description visually...'
        });
        localStorage.setItem('portfolioGallery', JSON.stringify(gallery));
        localStorage.setItem('portfolioGalleryCache', JSON.stringify(gallery));
        showToastBanner('Gallery image uploaded locally! Reloading...');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        console.error(err);
        showToastBanner('Failed to add gallery item locally.', 'error');
      }
    }
  };
  input.click();
}

// Reverting or saving edits
function deactivateEditMode(shouldSave = false) {
  triggerBtn.classList.remove('active');
  triggerBtn.innerHTML = `✏️ Edit Page Content`;
  editorBar.classList.remove('show');
  
  // Remove contentEditable
  document.querySelectorAll('.edit-outline').forEach(el => {
    el.contentEditable = 'false';
    el.classList.remove('edit-outline');
  });

  // Remove overlays
  document.querySelectorAll('.image-edit-overlay').forEach(el => el.remove());
  document.querySelectorAll('.image-edit-container').forEach(el => el.classList.remove('image-edit-container'));

  if (!shouldSave) {
    showToastBanner('Edits discarded. Reverting to saved values...');
    setTimeout(() => location.reload(), 1000);
  }
}

// Handle Cancelling
document.getElementById('btnEditorCancel').addEventListener('click', () => {
  isEditMode = false;
  deactivateEditMode(false);
});

// Handle Saving everything from DOM to backend config or LocalStorage
document.getElementById('btnEditorSave').addEventListener('click', async () => {
  try {
    showToastBanner('Processing site-wide live updates...');

    // 1. Gather config data
    let config = {};
    let isOffline = false;
    try {
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        config = await configRes.json();
      } else {
        throw new Error();
      }
    } catch (err) {
      isOffline = true;
      const stored = localStorage.getItem('portfolioData');
      const cache = localStorage.getItem('portfolioConfigCache');
      config = stored ? JSON.parse(stored) : (cache ? JSON.parse(cache) : {});
    }
    
    // Parse General Details
    const heroNameEl = document.querySelector('.hero-name');
    if (heroNameEl) config.name = heroNameEl.textContent.trim();
    
    const heroRoleEl = document.querySelector('.hero-role');
    if (heroRoleEl) config.role = heroRoleEl.textContent.trim();
    
    const heroDescEl = document.querySelector('.hero-desc');
    if (heroDescEl) {
      config.aboutText = heroDescEl.textContent.trim();
      config.desc = config.aboutText;
    }

    // Collect new custom visual-editor fields
    const heroTagTextEl = document.querySelector('.hero-tag-text');
    if (heroTagTextEl) config.heroTag = heroTagTextEl.textContent.trim();

    const heroAvailTextEl = document.querySelector('.hero-avail span');
    if (heroAvailTextEl) config.heroAvail = heroAvailTextEl.textContent.trim();

    const heroBtnPrimaryEl = document.querySelector('.hero-btns .btn-primary');
    if (heroBtnPrimaryEl) config.heroBtnPrimary = heroBtnPrimaryEl.textContent.trim();

    const heroBtnOutlineEl = document.querySelector('.hero-btns .btn-outline');
    if (heroBtnOutlineEl) config.heroBtnOutline = heroBtnOutlineEl.textContent.trim();

    const btnResumeTextEl = document.querySelector('.btn-resume');
    if (btnResumeTextEl) config.btnResumeText = btnResumeTextEl.textContent.trim();

    const logoBadgeEl = document.querySelector('.nav-badge');
    if (logoBadgeEl) config.logoBadge = logoBadgeEl.textContent.trim();

    // Collect navigation link texts
    config.navLinksText = {};
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.substring(1);
        config.navLinksText[id] = a.textContent.trim();
      }
    });

    // Collect section titles and labels dynamically
    config.sectionTitles = {};
    config.sectionLabels = {};
    const sectionIds = ['about', 'cases', 'experience', 'skills', 'process', 'contact'];
    sectionIds.forEach(id => {
      const sec = document.getElementById(id);
      if (sec) {
        const titleEl = sec.querySelector('.sec-title');
        if (titleEl) config.sectionTitles[id] = titleEl.textContent.trim();
        
        const labelEl = sec.querySelector('.sec-label');
        if (labelEl) config.sectionLabels[id] = labelEl.textContent.trim();
      }
    });

    // Collect contact details
    config.contactDetails = {};
    const emailRow = document.querySelector('a[href^="mailto:"]');
    if (emailRow) {
      const valEl = emailRow.querySelector('.c-val');
      if (valEl) config.contactDetails.email = valEl.textContent.trim();
    }
    
    document.querySelectorAll('.c-row').forEach(row => {
      const lblEl = row.querySelector('.c-lbl');
      const valEl = row.querySelector('.c-val');
      if (lblEl && valEl) {
        const lbl = lblEl.textContent.trim().toLowerCase();
        if (lbl === 'location') {
          config.contactDetails.location = valEl.textContent.trim();
        } else if (lbl === 'linkedin') {
          config.contactDetails.linkedin = valEl.textContent.trim();
        } else if (lbl === 'behance') {
          config.contactDetails.behance = valEl.textContent.trim();
        }
      }
    });

    // Gather selected color theme
    const themeSelect = document.getElementById('themeColorSelect');
    if (themeSelect) {
      config.themeColor = themeSelect.value;
    }

    // Capture profile picture from DOM
    const profileImg = document.querySelector('.photo-circle img');
    if (profileImg) {
      const src = profileImg.getAttribute('src');
      config.profileImage = src.startsWith('/') && !src.startsWith('data:') ? src.substring(1) : src;
      config.profileImg = config.profileImage;
    }

    // 2. Parse Case Studies from DOM (stacked vertical case-cards)
    const caseCards = Array.from(document.querySelectorAll('#casesGrid .case-card'));
    if (caseCards.length > 0) {
      config.cases = caseCards.map((card, idx) => {
        const img = card.querySelector('.case-img img');
        const imgUrl = img ? img.getAttribute('src') : '';
        const titleEl = card.querySelector('.case-title');
        const descEl = card.querySelector('.case-desc');
        const tags = Array.from(card.querySelectorAll('.case-tag')).map(t => t.textContent.trim());
        const title = titleEl ? titleEl.textContent.trim() : '';
        const desc = descEl ? descEl.textContent.trim() : '';
        
        return {
          num: `0${idx + 1}`,
          image: imgUrl.startsWith('/') && !imgUrl.startsWith('data:') ? imgUrl.substring(1) : imgUrl,
          cbgClass: `cbg${(idx % 3) + 1}`,
          tags,
          title,
          desc
        };
      });
    }

    // 3. Parse Timeline from DOM
    const tlItems = Array.from(document.querySelectorAll('#timelineGrid .tl-item'));
    if (tlItems.length > 0) {
      config.timeline = tlItems.map(card => {
        const emoji = card.querySelector('.tl-dot') ? card.querySelector('.tl-dot').textContent.trim() : '💼';
        const co = card.querySelector('.tl-co') ? card.querySelector('.tl-co').textContent.trim() : '';
        const role = card.querySelector('.tl-role') ? card.querySelector('.tl-role').textContent.trim() : '';
        const period = card.querySelector('.tl-period') ? card.querySelector('.tl-period').textContent.trim() : '';
        const desc = card.querySelector('.tl-desc') ? card.querySelector('.tl-desc').textContent.trim() : '';
        return { emoji, co, role, period, desc };
      });
    }

    // 4. Parse Skills from DOM
    const skillCards = Array.from(document.querySelectorAll('#skillsGrid .skill-card'));
    if (skillCards.length > 0) {
      config.skills = skillCards.map(card => {
        const ico = card.querySelector('.skill-ico') ? card.querySelector('.skill-ico').textContent.trim() : '🎯';
        const name = card.querySelector('.skill-name') ? card.querySelector('.skill-name').textContent.trim() : '';
        const sub = card.querySelector('.skill-sub') ? card.querySelector('.skill-sub').textContent.trim() : '';
        const pct = card.querySelector('.skill-pct') ? card.querySelector('.skill-pct').textContent.trim().replace('%', '') : '90';
        return { ico, name, sub, pct };
      });
    }

    // 5. Parse Design Process from DOM
    const processSteps = Array.from(document.querySelectorAll('#processGrid .p-step'));
    if (processSteps.length > 0) {
      config.process = processSteps.map((card, idx) => {
        const ico = card.querySelector('.p-icon') ? card.querySelector('.p-icon').textContent.trim() : '🔍';
        const num = card.querySelector('.p-num') ? card.querySelector('.p-num').textContent.trim() : `0${idx + 1}`;
        const name = card.querySelector('.p-name') ? card.querySelector('.p-name').textContent.trim() : '';
        const desc = card.querySelector('.p-desc') ? card.querySelector('.p-desc').textContent.trim() : '';
        return { ico, num, name, desc };
      });
    }

    // Save configuration
    if (!isOffline) {
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
      } catch (err) {
        console.log('Server save failed, saving locally instead...', err);
        isOffline = true;
      }
    }

    localStorage.setItem('portfolioData', JSON.stringify(config));
    localStorage.setItem('portfolioConfigCache', JSON.stringify(config));

    // 6. Gather gallery data (Only online)
    if (!isOffline) {
      try {
        const galleryRes = await fetch('/api/gallery');
        const gallery = await galleryRes.json();
        
        const galleryItems = Array.from(document.querySelectorAll('.gallery-grid .case-card'));
        const updatedGallery = galleryItems.map((card, idx) => {
          const img = card.querySelector('.case-img img');
          let imgPath = '';
          if (img) {
            const src = img.getAttribute('src');
            imgPath = src.startsWith('/') && !src.startsWith('data:') ? src.substring(1) : src;
          } else {
            imgPath = gallery[idx] ? gallery[idx].image : '';
          }

          const titleEl = card.querySelector('.case-title');
          const descEl = card.querySelector('.case-desc');
          const title = titleEl ? titleEl.textContent.trim() : '';
          const desc = descEl ? descEl.textContent.trim() : '';

          const original = gallery[idx] || {};
          return {
            id: original.id || `proj-${Date.now()}-${idx}`,
            title: title || original.title || 'Project Title',
            category: original.category || 'Branding',
            desc: desc || original.desc || '',
            image: imgPath || original.image || '',
            images: original.images || (imgPath ? [imgPath] : [])
          };
        });

        await fetch('/api/gallery/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedGallery)
        });
        localStorage.setItem('portfolioGalleryCache', JSON.stringify(updatedGallery));
      } catch (err) {
        console.log('Server gallery save failed during visual editor sync.', err);
      }
    }

    showToastBanner(isOffline ? '✓ Site changes saved locally in browser!' : '✓ Site saved and published successfully!', 'success');
    
    setTimeout(() => {
      isEditMode = false;
      deactivateEditMode(true);
      location.reload();
    }, 1500);

  } catch (err) {
    console.error(err);
    showToastBanner('Failed to save visual changes.', 'error');
  }
});

// Toast notification banner on main page
function showToastBanner(msg, type = 'info') {
  let banner = document.getElementById('liveEditorToast');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'liveEditorToast';
    banner.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      background: #181820;
      color: white;
      padding: 14px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      border: 1px solid var(--purple-soft);
      z-index: 1000000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    `;
    document.body.appendChild(banner);
  }

  if (type === 'success') {
    banner.style.background = '#22c55e';
    banner.style.borderColor = '#16a34a';
  } else if (type === 'error') {
    banner.style.background = '#ef4444';
    banner.style.borderColor = '#dc2626';
  } else {
    banner.style.background = '#181820';
    banner.style.borderColor = 'rgba(123, 94, 167, 0.25)';
  }

  banner.textContent = msg;
  banner.style.opacity = '1';
  banner.style.transform = 'translateY(0)';

  setTimeout(() => {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(20px)';
  }, 4000);
}

// Auto-activation on load for Admin Panel
function autoInitAdminEditor() {
  if (window.isAdminEditor && !isEditMode) {
    isEditMode = true;
    activateEditMode();
    if (triggerBtn) triggerBtn.style.display = 'none';
    
    // Set selected option in dropdown based on active configuration
    const themeSelect = document.getElementById('themeColorSelect');
    if (themeSelect && window.activeConfig && window.activeConfig.themeColor) {
      themeSelect.value = window.activeConfig.themeColor;
    } else if (themeSelect && window.currentAccentTheme) {
      themeSelect.value = window.currentAccentTheme;
    }
  }
}

// Listen to dynamic template rendering completion event
document.addEventListener('portfolioDataRendered', (e) => {
  autoInitAdminEditor();
  const themeSelect = document.getElementById('themeColorSelect');
  if (themeSelect && e.detail && e.detail.themeColor) {
    themeSelect.value = e.detail.themeColor;
  }
});

// Run immediately if config has already loaded and rendered
if (window.activeConfig) {
  autoInitAdminEditor();
}
