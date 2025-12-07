// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const fileInput = document.getElementById('fileInput');
  const fileName = document.getElementById('fileName');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const uploadedImage = document.getElementById('uploadedImage');
  const verifyButton = document.getElementById('verifyButton');
  const removeButton = document.getElementById('removeButton');
  const resultsSection = document.getElementById('results');
  const dropzone = document.querySelector('.upload-dropzone');
  const verificationPopup = document.getElementById('verificationPopup');
  const closePopup = document.getElementById('closePopup');
  const cancelVerification = document.getElementById('cancelVerification');
  const scanningImage = document.getElementById('scanningImage');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const progressSteps = document.querySelectorAll('.progress-step');
  
  // Current file reference
  let currentFile = null;
  let isProcessing = false;
  let progressTimeout = null;
  let animationStages = [];
  
  // File input change event
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    handleFileUpload(file);
  });
  
  // Handle file upload for preview
  function handleFileUpload(file) {
    if (!file) {
      alert('Please select an image file.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      fileInput.value = '';
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, GIF)');
      fileInput.value = '';
      return;
    }
    
    currentFile = file;
    
    // Update filename display
    fileName.textContent = file.name;
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImage.src = e.target.result;
      scanningImage.src = e.target.result; // Set image for scanning animation
      imagePreviewContainer.style.display = 'block';
      if (resultsSection) {
        resultsSection.style.display = 'none'; // Hide previous results
      }
      
      // Scroll to preview
      imagePreviewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    reader.readAsDataURL(file);
  }
  
  // Drag and drop functionality
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
    dropzone.style.borderColor = '#16a34a';
    dropzone.style.backgroundColor = '#f0fdf4';
  }
  
  function unhighlight() {
    dropzone.style.borderColor = '#d1d5db';
    dropzone.style.backgroundColor = '';
  }
  
  // Handle drop
  dropzone.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }
  
  // Remove button functionality
  removeButton.addEventListener('click', function() {
    fileInput.value = '';
    fileName.textContent = 'No file chosen';
    imagePreviewContainer.style.display = 'none';
    if (resultsSection) {
      resultsSection.style.display = 'none';
    }
    currentFile = null;
  });
  
  // Verify button functionality - SIMPLIFIED: Show verification popup directly
  verifyButton.addEventListener('click', function() {
    if (!currentFile) {
      alert('Please select an image first');
      return;
    }
    
    if (isProcessing) {
      return; // Prevent multiple clicks
    }
    
    // Show verification popup directly (removed pre-check)
    showVerificationPopup();
  });
  
  // Show verification popup
  function showVerificationPopup() {
    verificationPopup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Start the classification process
    startClassification();
  }
  
  // Start classification process
  function startClassification() {
    isProcessing = true;
    
    // Reset progress
    resetProgress();
    
    // Define the detailed animation stages
    animationStages = [
      { name: "Uploading & Verifying Image", duration: 1500, progress: 10, step: 1 },
      { name: "Processing Image Format", duration: 1200, progress: 20, step: 1 },
      { name: "Extracting Image Metadata", duration: 1000, progress: 25, step: 1 },
      { name: "Normalizing Image Dimensions", duration: 1800, progress: 30, step: 1 },
      { name: "Applying Color Correction", duration: 1400, progress: 35, step: 1 },
      { name: "Loading CNN Model", duration: 2000, progress: 40, step: 2 },
      { name: "Initializing Neural Network", duration: 1600, progress: 45, step: 2 },
      { name: "Extracting Leaf Features", duration: 2200, progress: 50, step: 2 },
      { name: "Analyzing Texture Patterns", duration: 1900, progress: 55, step: 2 },
      { name: "Detecting Color Variations", duration: 1700, progress: 60, step: 2 },
      { name: "Processing Convolutional Layers", duration: 2500, progress: 65, step: 3 },
      { name: "Analyzing Lesion Patterns", duration: 2100, progress: 70, step: 3 },
      { name: "Comparing with Disease Database", duration: 2300, progress: 75, step: 3 },
      { name: "Running Pattern Recognition", duration: 2000, progress: 80, step: 3 },
      { name: "Generating Confidence Scores", duration: 1800, progress: 85, step: 4 },
      { name: "Validating Results", duration: 1600, progress: 90, step: 4 },
      { name: "Compiling Final Report", duration: 1400, progress: 95, step: 4 },
      { name: "Finalizing Analysis", duration: 1200, progress: 98, step: 4 }
    ];
    
    // Start the detailed animation sequence
    startDetailedAnimation();
    
    // Actually send the image to Flask backend
    sendImageToBackend();
  }
  
  // Reset progress indicators
  function resetProgress() {
    progressFill.style.width = '0%';
    progressText.textContent = 'Starting analysis...';
    
    progressSteps.forEach(step => {
      step.classList.remove('active');
    });
    
    // Activate first step
    document.querySelector('.progress-step[data-step="1"]').classList.add('active');
  }
  
  // Start detailed animation sequence
  function startDetailedAnimation() {
    let currentStage = 0;
    
    const runNextStage = () => {
      if (currentStage >= animationStages.length || !isProcessing) {
        return;
      }
      
      const stage = animationStages[currentStage];
      
      // Update progress bar
      progressFill.style.width = stage.progress + '%';
      progressText.textContent = `${stage.name}... (${stage.progress}%)`;
      
      // Update active step
      progressSteps.forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.dataset.step) <= stage.step) {
          step.classList.add('active');
        }
      });
      
      // Add visual effect to scanning image based on stage
      applyStageEffect(stage.name);
      
      currentStage++;
      
      // Schedule next stage
      progressTimeout = setTimeout(runNextStage, stage.duration);
    };
    
    // Start animation
    progressTimeout = setTimeout(runNextStage, 500);
  }
  
  // Apply visual effects based on current processing stage
  function applyStageEffect(stageName) {
    const scanningContainer = document.querySelector('.scanning-image-container');
    
    // Reset any previous effects
    scanningContainer.style.filter = '';
    scanningContainer.style.transform = '';
    
    // Apply effects based on stage
    if (stageName.includes('Processing') || stageName.includes('Normalizing')) {
      // Pulse effect for processing stages
      scanningContainer.style.animation = 'pulseEffect 1s ease';
      setTimeout(() => {
        scanningContainer.style.animation = '';
      }, 1000);
    }
    
    if (stageName.includes('Color') || stageName.includes('Analyzing')) {
      // Color shift effect
      scanningContainer.style.filter = 'hue-rotate(20deg)';
      setTimeout(() => {
        scanningContainer.style.filter = '';
      }, 800);
    }
    
    if (stageName.includes('CNN') || stageName.includes('Neural')) {
      // Zoom effect for neural network stages
      scanningContainer.style.transform = 'scale(1.05)';
      setTimeout(() => {
        scanningContainer.style.transform = 'scale(1)';
      }, 1000);
    }
    
    if (stageName.includes('Pattern') || stageName.includes('Lesion')) {
      // Scan line intensifies
      const scannerLine = document.querySelector('.scanner-line');
      scannerLine.style.boxShadow = '0 0 20px var(--green-light)';
      scannerLine.style.height = '6px';
      setTimeout(() => {
        scannerLine.style.boxShadow = '0 0 10px var(--green-light)';
        scannerLine.style.height = '4px';
      }, 800);
    }
  }
  
  // Send image to Flask backend
  function sendImageToBackend() {
    const formData = new FormData();
    formData.append('image', currentFile);

    // Disable the file input during processing
    fileInput.disabled = true;
    verifyButton.disabled = true;
    verifyButton.innerHTML = '<span class="loading-spinner"></span>Processing...';

    // Make the POST request to the Flask backend
    fetch('/predict', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Handle "not_leaf" response from Flask
      if (data.prediction === 'not_leaf' || data.final_prediction === 'not_leaf') {
        completeProgressAnimation();
        setTimeout(() => {
          progressText.textContent = 'Analysis Complete - Not a leaf detected';
          showErrorAnimation();
          setTimeout(() => {
            hideVerificationPopup();
            // Show simple alert for non-leaf images
            alert(data.message || 'The uploaded image does not appear to be a potato leaf. Please upload a clear image of a potato leaf.');
            resetProcessingState();
          }, 1500);
        }, 1000);
        return;
      }
      
      // Complete the progress animation
      completeProgressAnimation();
      
      // Add a final processing stage
      setTimeout(() => {
        progressFill.style.width = '100%';
        progressText.textContent = 'Analysis Complete! Generating Results...';
        
        // Show completion animation
        showCompletionAnimation();
        
        // Close popup and show results after a short delay
        setTimeout(() => {
          hideVerificationPopup();
          showResults(data);
          resetProcessingState();
        }, 1500);
      }, 1000);
    })
    .catch(error => {
      console.error('Error:', error);
      
      // Update progress to show error
      progressText.textContent = 'Analysis Failed - Error Occurred';
      progressFill.style.backgroundColor = '#ef4444';
      
      // Show error animation
      showErrorAnimation();
      
      // Close popup after delay
      setTimeout(() => {
        hideVerificationPopup();
        alert('Error processing the image. Please try again.');
        resetProcessingState();
      }, 2000);
    });
  }
  
  // Complete progress animation
  function completeProgressAnimation() {
    clearTimeout(progressTimeout);
    
    // Ensure all steps are active
    progressSteps.forEach(step => {
      step.classList.add('active');
    });
  }
  
  // Show completion animation
  function showCompletionAnimation() {
    const scanningContainer = document.querySelector('.scanning-animation');
    const scannerLine = document.querySelector('.scanner-line');
    
    // Celebration animation
    scanningContainer.style.animation = 'celebrate 1s ease 3';
    scannerLine.style.display = 'none';
    
    // Add completion checkmark
    const checkmark = document.createElement('div');
    checkmark.innerHTML = '✓';
    checkmark.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      color: #16a34a;
      background: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 0 20px rgba(22, 163, 74, 0.3);
      animation: checkmarkPop 0.5s ease;
    `;
    scanningContainer.appendChild(checkmark);
  }
  
  // Show error animation
  function showErrorAnimation() {
    const scanningContainer = document.querySelector('.scanning-animation');
    const scannerLine = document.querySelector('.scanner-line');
    
    // Error animation
    scanningContainer.style.animation = 'errorShake 0.5s ease 3';
    scannerLine.style.display = 'none';
    
    // Add error symbol
    const errorSymbol = document.createElement('div');
    errorSymbol.innerHTML = '✗';
    errorSymbol.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      color: #ef4444;
      background: white;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
      animation: errorPop 0.5s ease;
    `;
    scanningContainer.appendChild(errorSymbol);
  }
  
  // Hide verification popup
  function hideVerificationPopup() {
    verificationPopup.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Clean up animations
    const scanningContainer = document.querySelector('.scanning-animation');
    const scannerLine = document.querySelector('.scanner-line');
    
    scanningContainer.style.animation = '';
    scannerLine.style.display = '';
    
    // Remove any added symbols
    const symbols = scanningContainer.querySelectorAll('div[style*="position: absolute"]');
    symbols.forEach(symbol => symbol.remove());
  }
  
  // Reset processing state
  function resetProcessingState() {
    isProcessing = false;
    fileInput.disabled = false;
    verifyButton.disabled = false;
    verifyButton.innerHTML = '<span class="verify-icon">🔍</span>Verify & Classify Image';
    progressFill.style.backgroundColor = ''; // Reset to default
    
    // Reset scanner line
    const scannerLine = document.querySelector('.scanner-line');
    scannerLine.style.display = '';
    
    // Clear any timeouts
    clearTimeout(progressTimeout);
  }
  
  // Show results with data from backend
  function showResults(data) {
    // Update UI with prediction result
    if (resultsSection) {
      resultsSection.style.display = 'block';
    } else {
      console.error('Results section not found');
      return;
    }
    
    // Extract data from Flask response
    const finalPrediction = data.final_prediction || data.prediction;
    const readablePrediction = data.readable_prediction || 
                              (data.final_prediction === 'potato_healthy' ? 'Healthy' :
                               data.final_prediction === 'potato_early_blight' ? 'Early Blight' :
                               data.final_prediction === 'potato_late_blight' ? 'Late Blight' :
                               'Unknown');
    const confidence = data.confidence || (data.probability || 0);
    
    // Create a visually appealing version for disease classification
    let diseaseText = readablePrediction;
    let diseaseColor = '';
    let diseaseIcon = '';

    switch (finalPrediction) {
      case 'potato_healthy':
        diseaseText = 'Healthy Leaves';
        diseaseColor = '#16a34a';
        diseaseIcon = '🍀';
        break;
      case 'potato_early_blight':
        diseaseText = 'Early Blight';
        diseaseColor = '#fbbf24';
        diseaseIcon = '💧';
        break;
      case 'potato_late_blight':
        diseaseText = 'Late Blight';
        diseaseColor = '#ef4444';
        diseaseIcon = '🌬️';
        break;
      default:
        diseaseText = 'Unknown';
        diseaseColor = '#6b7280';
        diseaseIcon = '❓';
    }

    // Animate the result display
    const resultDiseaseElement = document.getElementById('result-disease');
    if (!resultDiseaseElement) {
      console.error('Result disease element not found');
      return;
    }
    
    resultDiseaseElement.innerHTML = `<span style="color: ${diseaseColor}; font-weight: bold;">${diseaseText}</span>`;
    resultDiseaseElement.style.opacity = '0';
    resultDiseaseElement.style.transform = 'translateY(50px)';
    
    const resultIconElement = document.getElementById('resultIcon');
    if (resultIconElement) {
      resultIconElement.textContent = diseaseIcon;
    }

    // Update confidence value with animation
    const confidencePercentage = (confidence * 100).toFixed(2);
    const confidenceElement = document.getElementById('confidence-value');
    if (!confidenceElement) {
      console.error('Confidence element not found');
      return;
    }
    
    confidenceElement.textContent = '0%';
    confidenceElement.style.opacity = '0';

    // Update the confidence bar with animation
    const confidenceBar = document.getElementById('confidence-bar');
    if (!confidenceBar) {
      console.error('Confidence bar element not found');
      return;
    }
    
    confidenceBar.style.width = '0%';
    
    // Animate results in sequence
    setTimeout(() => {
      // Animate disease text
      resultDiseaseElement.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      resultDiseaseElement.style.opacity = '1';
      resultDiseaseElement.style.transform = 'translateY(0)';
      
      // Animate confidence bar
      setTimeout(() => {
        confidenceBar.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
        confidenceBar.style.width = confidence * 100 + '%';
        
        // Animate confidence value counting up
        let currentPercent = 0;
        const targetPercent = parseFloat(confidencePercentage);
        const interval = setInterval(() => {
          currentPercent += 1;
          if (currentPercent >= targetPercent) {
            currentPercent = targetPercent;
            clearInterval(interval);
          }
          confidenceElement.textContent = currentPercent.toFixed(2) + '%';
        }, 20);
        
        confidenceElement.style.transition = 'opacity 0.5s ease';
        confidenceElement.style.opacity = '1';
        
        // Change the color of the confidence bar based on the prediction confidence
        setTimeout(() => {
          if (confidence >= 0.8) {
            confidenceBar.className = 'confidence-fill confidence-fill-high';
          } else if (confidence >= 0.5) {
            confidenceBar.className = 'confidence-fill confidence-fill-medium';
          } else {
            confidenceBar.className = 'confidence-fill confidence-fill-low';
          }
          
          // Update description and treatment with fade-in
          updateDescriptions(finalPrediction);
        }, 500);
      }, 500);
    }, 300);
  }
  
  // Update descriptions with animations
  function updateDescriptions(prediction) {
    // Update description and treatment based on the prediction
    const description = {
      "potato_healthy": "Your potato leaves appear healthy and disease-free. The foliage shows normal green coloration and structure with no visible signs of disease or stress. Healthy leaves are crucial for optimal photosynthesis and potato tuber development.",
      "potato_early_blight": "Early blight (Alternaria solani) is detected. Characterized by dark brown to black spots with concentric rings on older leaves, often surrounded by a yellow halo. The disease typically starts on lower leaves and progresses upward under warm, humid conditions.",
      "potato_late_blight": "Late blight (Phytophthora infestans) is detected. Shows as water-soaked lesions that rapidly expand into large brown to purplish-black areas. Under moist conditions, a white fuzzy growth may appear on lesion undersides. This is a highly destructive disease that can kill plants within days."
    };

    const treatment = {
      "potato_healthy": "No immediate treatment needed. Continue good cultural practices:\n1. Maintain consistent watering\n2. Monitor for pests regularly\n3. Ensure proper soil nutrition\n4. Practice crop rotation annually\n5. Remove any diseased plant debris from the area",
      "potato_early_blight": "Immediate action recommended:\n1. Apply fungicides containing chlorothalonil, mancozeb, or copper-based products\n2. Remove and destroy severely infected leaves\n3. Improve air circulation through proper plant spacing\n4. Avoid overhead watering to reduce leaf wetness\n5. Apply mulch to prevent soil splash\n6. Consider resistant potato varieties for future planting",
      "potato_late_blight": "URGENT treatment required:\n1. Apply fungicides immediately (products containing mancozeb, chlorothalonil, or fluazinam)\n2. Remove and destroy all infected plant parts\n3. Improve field drainage and air circulation\n4. Stop overhead irrigation completely\n5. Destroy infected tubers to prevent soil contamination\n6. Consider systemic fungicides for severe infections\n7. Monitor nearby plants for spread"
    };

    const descElement = document.getElementById('result-description');
    const treatElement = document.getElementById('result-treatment');
    
    if (!descElement || !treatElement) {
      console.error('Description or treatment elements not found');
      return;
    }
    
    descElement.textContent = description[prediction] || 'No description available.';
    treatElement.textContent = treatment[prediction] || 'No treatment available.';
    
    // Animate description appearance
    descElement.style.opacity = '0';
    descElement.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      descElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      descElement.style.opacity = '1';
      descElement.style.transform = 'translateY(0)';
      
      // Animate treatment appearance
      setTimeout(() => {
        treatElement.style.opacity = '0';
        treatElement.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          treatElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          treatElement.style.opacity = '1';
          treatElement.style.transform = 'translateY(0)';
        }, 200);
      }, 300);
    }, 400);

    // Scroll to results
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  // Close popup buttons
  closePopup.addEventListener('click', function() {
    if (!isProcessing) {
      hideVerificationPopup();
    } else {
      if (confirm('Classification is in progress. Are you sure you want to cancel?')) {
        hideVerificationPopup();
        resetProcessingState();
      }
    }
  });
  
  cancelVerification.addEventListener('click', function() {
    if (!isProcessing) {
      hideVerificationPopup();
    } else {
      if (confirm('Classification is in progress. Are you sure you want to cancel?')) {
        hideVerificationPopup();
        resetProcessingState();
      }
    }
  });
  
  // Close popup when clicking outside
  verificationPopup.addEventListener('click', function(e) {
    if (e.target === verificationPopup) {
      if (!isProcessing) {
        hideVerificationPopup();
      } else {
        if (confirm('Classification is in progress. Are you sure you want to cancel?')) {
          hideVerificationPopup();
          resetProcessingState();
        }
      }
    }
  });
  
  // Close popup with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && verificationPopup.style.display === 'flex') {
      if (!isProcessing) {
        hideVerificationPopup();
      } else {
        if (confirm('Classification is in progress. Are you sure you want to cancel?')) {
          hideVerificationPopup();
          resetProcessingState();
        }
      }
    }
  });
  
  // Add CSS animations for visual effects
  addAnimationStyles();
});

// Add CSS animation styles dynamically
function addAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulseEffect {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }
    
    @keyframes celebrate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes checkmarkPop {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      70% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes errorShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    @keyframes errorPop {
      0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
      70% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    .scanning-animation {
      position: relative;
      width: 200px;
      height: 200px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(22, 163, 74, 0.2);
      border: 3px solid var(--green-soft);
    }
    
    .scanner-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, 
        transparent, 
        var(--green-light), 
        transparent);
      box-shadow: 0 0 10px var(--green-light);
      animation: scan 2s linear infinite;
      z-index: 2;
    }
    
    @keyframes scan {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(200px);
      }
      100% {
        transform: translateY(0);
      }
    }
    
    .confidence-fill {
      transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease;
    }
    
    .confidence-fill-high {
      background: linear-gradient(90deg, #16a34a, #22c55e);
    }
    
    .confidence-fill-medium {
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
    }
    
    .confidence-fill-low {
      background: linear-gradient(90deg, #ef4444, #dc2626);
    }
  `;
  document.head.appendChild(style);
}