/**
 * Message page functionality
 * Handles the read more/less toggle for leadership messages
 */

function toggleMessage(id) {
  const dots = document.getElementById(`dots-${id}`);
  const moreText = document.getElementById(`more-${id}`);
  const btnText = document.getElementById(`btn-${id}`);

  if (moreText.style.display === "block") {
    // If expanded, collapse it
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    // If collapsed, expand it
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "block";
  }
}
/*
document.addEventListener('DOMContentLoaded', function() {
    alert(JSON.stringify({message: 'DOM fully loaded and parsed'}));
    // Get all read more buttons
    const readMoreButtons = document.querySelectorAll('.read-more-button');
    const closeButtons = document.querySelectorAll('.close-message');
    
    // Add click event to each read more button
    readMoreButtons.forEach(button => {
        alert(JSON.stringify({message: 'Adding click event to read more button'}));
        alert(JSON.stringify({messageId: button.getAttribute('data-message-id')}));
        button.addEventListener('click', function() {
            const messageId = this.getAttribute('data-message-id');
            const fullMessage = document.getElementById(`${messageId}-full-message`);
            fullMessage.style.display = 'block';
            this.style.display = 'none';
        });
    });

    closeButtons.forEach(button => {
      
        button.addEventListener('click', function() {
            // Find the parent full message element
            const fullMessage = this.closest('.full-message');
            const messageContent = fullMessage.parentElement;
            const readMoreButton = messageContent.querySelector('.read-more-button');
            
            // Hide the full message
            fullMessage.style.display = 'none';
            
            // Show the read more button again
            readMoreButton.style.display = 'inline-block';
            
            // Scroll back to the message item
            const messageItem = messageContent.closest('.message-item');
            messageItem.scrollIntoView({ behavior: 'smooth' });
        });
    });
});*/