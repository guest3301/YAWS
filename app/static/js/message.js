document.addEventListener('DOMContentLoaded', function() {
    // Core elements
    const cube = document.querySelector('.cube');
    const buttons = document.querySelectorAll('.cube-controls button');
    
    // Current face tracker (0: front, 1: right, 2: back, 3: left)
    let currentFaceIndex = 0;
    
    // Track cube's current rotation
    let currentRotationY = 0;
    let isAnimating = false;
    
    // Define rotation values for each face with enhanced 3D effect
    const faces = {
        'front': { 
            y: 0, 
            index: 0,
        },
        'right': { 
            y: -90, 
            index: 1,
        },
        'back': { 
            y: 180, 
            index: 2,
        },
        'left': { 
            y: 90, 
            index: 3,
        }
    };
    
    // Add eased rotation animation effect
    function animateRotation(targetY) {
        if (isAnimating) return;
        
        isAnimating = true;
        const startY = currentRotationY;
        const distance = calculateShortestRotationDistance(startY, targetY);
        const duration = 1000; // ms
        const startTime = performance.now();
        
        function updateFrame(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function: cubic-bezier
            const easedProgress = easeInOutCubic(progress);
            
            // Calculate current position
            const currentY = startY + distance * easedProgress;
            
            // Apply rotation transform including a slight tilt for better 3D effect
            cube.style.transform = `rotateY(${currentY}deg) rotateX(${Math.sin(elapsedTime/1000) * 2}deg)`;
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(updateFrame);
            } else {
                // Snap to exact target position at the end
                cube.style.transform = `rotateY(${targetY}deg)`;
                currentRotationY = normalizeAngle(targetY);
                isAnimating = false;
            }
        }
        
        requestAnimationFrame(updateFrame);
    }
    
    // Easing function for smoother animation
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Calculate shortest rotation path (clockwise or counterclockwise)
    function calculateShortestRotationDistance(startAngle, endAngle) {
        // Normalize angles to 0-360 range
        startAngle = normalizeAngle(startAngle);
        endAngle = normalizeAngle(endAngle);
        
        // Find the shortest distance
        let clockwiseDistance = endAngle - startAngle;
        let counterclockwiseDistance = startAngle - endAngle;
        
        // Adjust for crossing the 0/360 boundary
        if (clockwiseDistance < 0) clockwiseDistance += 360;
        if (counterclockwiseDistance < 0) counterclockwiseDistance += 360;
        
        // Return the shortest path
        return clockwiseDistance <= counterclockwiseDistance ? clockwiseDistance : -counterclockwiseDistance;
    }
    
    // Normalize angle to 0-360 range
    function normalizeAngle(angle) {
        return ((angle % 360) + 360) % 360;
    }
    
    // Function to rotate the cube
    function rotateTo(face) {
        if (isAnimating) return;
        
        // Get rotation values
        const rotation = faces[face];
        
        // Update current face index
        currentFaceIndex = rotation.index;
        
        // Animate to the target rotation
        animateRotation(rotation.y);
        
        // Update active button state
        updateActiveButton();
    }
    
    // Update active button based on current face
    function updateActiveButton() {
        buttons.forEach(btn => {
            const btnFace = btn.getAttribute('data-face');
            if (faces[btnFace].index === currentFaceIndex) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Set up button click listeners
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const targetFace = this.getAttribute('data-face');
            rotateTo(targetFace);
        });
    });
    
    // Touch swipe functionality
    const cubeContainer = document.querySelector('.cube-container');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    cubeContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    cubeContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            navigateFace('prev');
        } else if (e.key === 'ArrowRight') {
            navigateFace('next');
        }
    });
    
    // Handle swipe gesture with improved detection
    function handleSwipe() {
        const threshold = 75; // Minimum swipe distance
        const horizontalDistance = touchEndX - touchStartX;
        const verticalDistance = touchEndY - touchStartY;
        
        // Only respond to horizontal swipes (ignore vertical swipes)
        if (Math.abs(horizontalDistance) >= threshold && 
            Math.abs(horizontalDistance) > Math.abs(verticalDistance)) {
            
            if (horizontalDistance > 0) {
                // Swipe right - previous face
                navigateFace('prev');
            } else {
                // Swipe left - next face
                navigateFace('next');
            }
        }
    }
    
    // Navigate to next or previous face
    function navigateFace(direction) {
        if (isAnimating) return;
        
        // Calculate new index
        let newIndex = currentFaceIndex;
        
        if (direction === 'next') {
            newIndex = (currentFaceIndex + 1) % 4;
        } else if (direction === 'prev') {
            newIndex = (currentFaceIndex - 1 + 4) % 4;
        }
        
        // Find the face with this index
        const targetFace = Object.keys(faces).find(face => 
            faces[face].index === newIndex
        );
        
        // Rotate to that face
        rotateTo(targetFace);
    }
    
    // Add mouse drag functionality for desktop
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;
    let dragStartRotation = 0;
    
    cubeContainer.addEventListener('mousedown', function(e) {
        if (!isAnimating) {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartRotation = currentRotationY;
            cubeContainer.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            dragCurrentX = e.clientX;
            const dragDelta = dragCurrentX - dragStartX;
            
            // Convert drag distance to rotation degrees (sensitivity adjustment)
            const rotationDelta = dragDelta * 0.5;
            
            // Apply rotation directly while dragging
            cube.style.transform = `rotateY(${dragStartRotation + rotationDelta}deg)`;
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        if (isDragging) {
            isDragging = false;
            cubeContainer.style.cursor = '';
            
            const dragDelta = dragCurrentX - dragStartX;
            
            if (Math.abs(dragDelta) > 50) {
                // If drag distance is significant, snap to next/prev face
                if (dragDelta > 0) {
                    navigateFace('prev'); // Dragging right goes to previous face
                } else {
                    navigateFace('next'); // Dragging left goes to next face
                }
            } else {
                // If drag distance is small, snap back to current face
                rotateTo(Object.keys(faces).find(face => 
                    faces[face].index === currentFaceIndex
                ));
            }
        }
    });
    
    // Initialize to front face
    rotateTo('front');
});