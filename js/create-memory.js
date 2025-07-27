// Memory Creation Workflow for MemoryVerse

let currentState = {
    currentStep: 1,
    selectedTemplate: null,
    uploadedPhotos: [],
    memoryDescription: '',
    generatedMemory: null
};

// Initialize memory creation workflow
function initializeMemoryCreation() {
    updateProgressBar();
    setupTemplateSelection();
    setupPhotoUpload();
    setupDescriptionEditor();
    updateContinueButtons();
}

// Progress Management
function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentState.currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentState.currentStep) {
            step.classList.add('active');
        }
    });
    
    progressLines.forEach((line, index) => {
        line.classList.toggle('completed', index + 1 < currentState.currentStep);
    });
}

function nextStep() {
    if (currentState.currentStep < 4 && canProceedToNextStep()) {
        // Hide current step
        document.getElementById(`step-${currentState.currentStep}`).classList.remove('active');
        
        // Update state
        currentState.currentStep++;
        
        // Show next step
        document.getElementById(`step-${currentState.currentStep}`).classList.add('active');
        
        // Update progress bar
        updateProgressBar();
        
        // Handle step-specific logic
        handleStepTransition();
        
        // Update continue buttons
        updateContinueButtons();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function previousStep() {
    if (currentState.currentStep > 1) {
        // Hide current step
        document.getElementById(`step-${currentState.currentStep}`).classList.remove('active');
        
        // Update state
        currentState.currentStep--;
        
        // Show previous step
        document.getElementById(`step-${currentState.currentStep}`).classList.add('active');
        
        // Update progress bar
        updateProgressBar();
        
        // Update continue buttons
        updateContinueButtons();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function canProceedToNextStep() {
    switch (currentState.currentStep) {
        case 1: // Template selection
            return currentState.selectedTemplate !== null;
        case 2: // Photo upload
            const requiredPhotos = getRequiredPhotoCount();
            return currentState.uploadedPhotos.length >= requiredPhotos;
        case 3: // Description
            return currentState.memoryDescription.trim().length >= 50;
        default:
            return false;
    }
}

function handleStepTransition() {
    switch (currentState.currentStep) {
        case 2: // Moving to photo upload
            setupUploadSlots();
            break;
        case 3: // Moving to description
            // Focus on description editor
            setTimeout(() => {
                const editor = document.getElementById('memory-description');
                if (editor) editor.focus();
            }, 300);
            break;
        case 4: // Moving to generation
            startMemoryGeneration();
            break;
    }
}

// Template Selection
function setupTemplateSelection() {
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            selectTemplate(template);
        });
    });
}

function selectTemplate(templateType) {
    // Remove previous selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new template
    const selectedCard = document.querySelector(`[data-template="${templateType}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        currentState.selectedTemplate = templateType;
        
        // Update instruction text
        updateUploadInstruction(templateType);
        
        // Enable continue button
        updateContinueButtons();
        
        // Show selection feedback
        showNotification(`${getTemplateName(templateType)} template selected! ✨`, 'success');
    }
}

function getTemplateName(templateType) {
    const names = {
        single: 'Single Photo',
        dual: 'Dual Photos',
        collage: 'Photo Collage'
    };
    return names[templateType] || templateType;
}

function getRequiredPhotoCount() {
    const counts = {
        single: 1,
        dual: 2,
        collage: 5
    };
    return counts[currentState.selectedTemplate] || 1;
}

function updateUploadInstruction(templateType) {
    const instruction = document.getElementById('upload-instruction');
    if (instruction) {
        const messages = {
            single: 'Upload 1 photo for your memory book',
            dual: 'Upload 2 photos for your memory book',
            collage: 'Upload 3-5 photos for your memory book'
        };
        instruction.textContent = messages[templateType] || 'Upload your photos';
    }
}

// Photo Upload System
function setupPhotoUpload() {
    // This will be called when moving to step 2
}

function setupUploadSlots() {
    const uploadGrid = document.getElementById('upload-grid');
    if (!uploadGrid) return;
    
    uploadGrid.innerHTML = '';
    
    const requiredPhotos = getRequiredPhotoCount();
    const maxPhotos = currentState.selectedTemplate === 'collage' ? 5 : requiredPhotos;
    
    for (let i = 0; i < maxPhotos; i++) {
        const slot = createUploadSlot(i);
        uploadGrid.appendChild(slot);
    }
}

function createUploadSlot(index) {
    const slot = document.createElement('div');
    slot.className = 'upload-slot';
    slot.dataset.index = index;
    
    slot.innerHTML = `
        <div class="upload-icon">📸</div>
        <div class="upload-text">Click to upload photo</div>
        <div class="upload-hint">or drag and drop</div>
        <input type="file" accept="image/*" style="display: none;" onchange="handleFileSelect(this, ${index})">
    `;
    
    // Add click handler
    slot.addEventListener('click', () => {
        if (!slot.classList.contains('uploaded')) {
            slot.querySelector('input').click();
        }
    });
    
    // Add drag and drop handlers
    slot.addEventListener('dragover', handleDragOver);
    slot.addEventListener('dragleave', handleDragLeave);
    slot.addEventListener('drop', (e) => handleDrop(e, index));
    
    return slot;
}

function handleFileSelect(input, index) {
    const file = input.files[0];
    if (file) {
        processUploadedFile(file, index);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e, index) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processUploadedFile(files[0], index);
    }
}

function processUploadedFile(file, index) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    // Create file reader
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        updateUploadSlot(index, file, imageUrl);
        
        // Update state
        currentState.uploadedPhotos[index] = {
            file: file,
            url: imageUrl,
            name: file.name
        };
        
        // Update continue button
        updateContinueButtons();
        
        showNotification(`Photo ${index + 1} uploaded successfully! 📸`, 'success');
    };
    
    reader.readAsDataURL(file);
}

function updateUploadSlot(index, file, imageUrl) {
    const slot = document.querySelector(`[data-index="${index}"]`);
    if (!slot) return;
    
    slot.classList.add('uploaded');
    slot.innerHTML = `
        <img src="${imageUrl}" alt="Uploaded photo" class="uploaded-image">
        <div class="upload-text">${file.name}</div>
        <div class="image-actions">
            <button class="remove-btn" onclick="removePhoto(${index})">Remove</button>
        </div>
    `;
}

function removePhoto(index) {
    // Remove from state
    currentState.uploadedPhotos.splice(index, 1);
    
    // Rebuild upload slots
    setupUploadSlots();
    
    // Restore uploaded photos
    currentState.uploadedPhotos.forEach((photo, i) => {
        if (photo) {
            updateUploadSlot(i, { name: photo.name }, photo.url);
        }
    });
    
    // Update continue button
    updateContinueButtons();
    
    showNotification('Photo removed', 'info');
}

// Description Editor
function setupDescriptionEditor() {
    const editor = document.getElementById('memory-description');
    const charCount = document.getElementById('char-count');
    
    if (!editor) return;
    
    editor.addEventListener('input', () => {
        const text = editor.textContent || editor.innerText || '';
        currentState.memoryDescription = text;
        
        // Update character count
        if (charCount) {
            charCount.textContent = text.length;
            charCount.style.color = text.length > 2000 ? '#ff4444' : 'rgba(255, 255, 255, 0.6)';
        }
        
        // Update continue button
        updateContinueButtons();
    });
    
    editor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    });
}

function formatText(command) {
    document.execCommand(command, false, null);
    
    // Update toolbar button states
    updateToolbarButtons();
}

function updateToolbarButtons() {
    const buttons = document.querySelectorAll('.toolbar-btn');
    buttons.forEach(btn => {
        const command = btn.onclick.toString().match(/formatText\('(\w+)'\)/);
        if (command) {
            const isActive = document.queryCommandState(command[1]);
            btn.classList.toggle('active', isActive);
        }
    });
}

function insertEmoji() {
    document.getElementById('emoji-modal').style.display = 'flex';
}

function closeEmojiPicker() {
    document.getElementById('emoji-modal').style.display = 'none';
}

function insertEmojiText(emoji) {
    const editor = document.getElementById('memory-description');
    if (editor) {
        editor.focus();
        document.execCommand('insertText', false, emoji);
        
        // Update state
        const text = editor.textContent || editor.innerText || '';
        currentState.memoryDescription = text;
        
        // Update character count
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = text.length;
        }
    }
    
    closeEmojiPicker();
}

function addSuggestion(text) {
    const editor = document.getElementById('memory-description');
    if (editor) {
        editor.focus();
        
        // Insert at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(document.createTextNode(text));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            // Append to end
            editor.textContent += text;
        }
        
        // Update state
        const fullText = editor.textContent || editor.innerText || '';
        currentState.memoryDescription = fullText;
        
        // Update character count
        const charCount = document.getElementById('char-count');
        if (charCount) {
            charCount.textContent = fullText.length;
        }
        
        // Update continue button
        updateContinueButtons();
    }
}

// Memory Generation
function startMemoryGeneration() {
    const loadingElement = document.getElementById('generation-loading');
    const resultElement = document.getElementById('memory-book-result');
    const finalActions = document.getElementById('final-actions');
    
    if (loadingElement) loadingElement.style.display = 'block';
    if (resultElement) resultElement.style.display = 'none';
    if (finalActions) finalActions.style.display = 'none';
    
    simulateMemoryGeneration();
}

async function simulateMemoryGeneration() {
    const loadingMessages = [
        'Analyzing your photos...',
        'Enhancing image quality...',
        'Generating artistic backgrounds...',
        'Creating beautiful layouts...',
        'Adding your story text...',
        'Preparing your memory book...'
    ];
    
    const messageElement = document.getElementById('loading-message');
    const progressElement = document.getElementById('progress-fill');
    
    for (let i = 0; i < loadingMessages.length; i++) {
        if (messageElement) {
            messageElement.textContent = loadingMessages[i];
        }
        
        if (progressElement) {
            progressElement.style.width = `${((i + 1) / loadingMessages.length) * 100}%`;
        }
        
        // Wait for realistic timing
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate the memory book
    generateMemoryBook();
    
    // Show result
    setTimeout(() => {
        document.getElementById('generation-loading').style.display = 'none';
        document.getElementById('memory-book-result').style.display = 'grid';
        document.getElementById('final-actions').style.display = 'flex';
        
        showNotification('Your beautiful memory book is ready! 🎉', 'success');
    }, 1000);
}

function generateMemoryBook() {
    const flipbookContainer = document.getElementById('flipbook-container');
    if (!flipbookContainer) return;
    
    // Create a simple memory book preview
    const memoryBook = createMemoryBookPreview();
    flipbookContainer.innerHTML = memoryBook;
    
    // Store generated memory
    currentState.generatedMemory = {
        template: currentState.selectedTemplate,
        photos: currentState.uploadedPhotos,
        description: currentState.memoryDescription,
        createdAt: new Date().toISOString(),
        id: Date.now().toString()
    };
}

function createMemoryBookPreview() {
    const template = currentState.selectedTemplate;
    const photos = currentState.uploadedPhotos;
    const description = currentState.memoryDescription;
    
    let bookHTML = `
        <div style="padding: 2rem; max-width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; text-align: center;">
            <h2 style="margin-bottom: 2rem; font-size: 2rem; color: #ffd700;">Your Memory Book</h2>
    `;
    
    // Add photos based on template
    if (template === 'single' && photos[0]) {
        bookHTML += `
            <div style="margin-bottom: 2rem;">
                <img src="${photos[0].url}" style="max-width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            </div>
        `;
    } else if (template === 'dual' && photos.length >= 2) {
        bookHTML += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                <img src="${photos[0].url}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
                <img src="${photos[1].url}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
            </div>
        `;
    } else if (template === 'collage' && photos.length >= 3) {
        bookHTML += `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 0.5rem; margin-bottom: 2rem;">
        `;
        photos.slice(0, 5).forEach(photo => {
            bookHTML += `<img src="${photo.url}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 6px;">`;
        });
        bookHTML += `</div>`;
    }
    
    // Add description
    const truncatedDescription = description.length > 150 ? 
        description.substring(0, 150) + '...' : description;
    
    bookHTML += `
            <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 12px; font-style: italic; line-height: 1.6;">
                "${truncatedDescription}"
            </div>
            <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                Created with MemoryVerse ✨
            </div>
        </div>
    `;
    
    return bookHTML;
}

// Download and Share Functions
function downloadAsPDF() {
    showNotification('PDF download feature coming soon! 📄', 'info');
    // Here you would implement PDF generation
}

function downloadAsImages() {
    showNotification('Image download feature coming soon! 🖼️', 'info');
    // Here you would implement image generation
}

function shareToInstagram() {
    showNotification('Instagram sharing feature coming soon! 📷', 'info');
    // Here you would implement Instagram integration
}

function copyShareLink() {
    // Generate a shareable link
    const shareLink = `https://memoryverse.com/memory/${currentState.generatedMemory.id}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareLink).then(() => {
            showNotification('Share link copied to clipboard! 🔗', 'success');
        }).catch(() => {
            fallbackCopyText(shareLink);
        });
    } else {
        fallbackCopyText(shareLink);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showNotification('Share link copied to clipboard! 🔗', 'success');
    } catch (err) {
        showNotification('Could not copy link. Please copy manually: ' + text, 'error');
    }
    
    document.body.removeChild(textArea);
}

function saveToCollection() {
    const session = getCurrentSession();
    if (!session) {
        showNotification('Please log in to save memories', 'error');
        return;
    }
    
    // Get existing memories
    const users = JSON.parse(localStorage.getItem('memoryverse_users') || '[]');
    const userIndex = users.findIndex(u => u.id === session.userId);
    
    if (userIndex === -1) {
        showNotification('User not found', 'error');
        return;
    }
    
    // Add memory to user's collection
    if (!users[userIndex].memories) {
        users[userIndex].memories = [];
    }
    
    users[userIndex].memories.push(currentState.generatedMemory);
    localStorage.setItem('memoryverse_users', JSON.stringify(users));
    
    showNotification('Memory saved to your collection! ⭐', 'success');
}

function createAnother() {
    // Reset state
    currentState = {
        currentStep: 1,
        selectedTemplate: null,
        uploadedPhotos: [],
        memoryDescription: '',
        generatedMemory: null
    };
    
    // Reset UI
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById('step-1').classList.add('active');
    
    // Clear forms
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const editor = document.getElementById('memory-description');
    if (editor) {
        editor.textContent = '';
    }
    
    const charCount = document.getElementById('char-count');
    if (charCount) {
        charCount.textContent = '0';
    }
    
    // Update UI
    updateProgressBar();
    updateContinueButtons();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showNotification('Ready to create another memory! ✨', 'success');
}

function viewCollection() {
    showNotification('My Collection feature coming soon! 📚', 'info');
    // Here you would redirect to the user's memory collection
    // window.location.href = 'my-memories.html';
}

// Continue Button Management
function updateContinueButtons() {
    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById(`continue-btn-${i}`);
        if (btn) {
            if (i === currentState.currentStep) {
                btn.disabled = !canProceedToNextStep();
            }
        }
    }
}

// Export functions for global access
if (typeof window !== 'undefined') {
    window.MemoryCreation = {
        selectTemplate,
        nextStep,
        previousStep,
        removePhoto,
        formatText,
        insertEmoji,
        closeEmojiPicker,
        insertEmojiText,
        addSuggestion,
        downloadAsPDF,
        downloadAsImages,
        shareToInstagram,
        copyShareLink,
        saveToCollection,
        createAnother,
        viewCollection
    };
}
