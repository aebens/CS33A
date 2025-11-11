document.addEventListener('DOMContentLoaded', function() {
    const followBtn = document.getElementById('follow-btn');
    const csrfToken = document.getElementById('csrf-token').value;
    
    if (followBtn) {
        followBtn.addEventListener('click', function() {
            const username = this.dataset.username;

            // This uses the text in the button that is clicked on
            const isFollowing = this.textContent === 'Unfollow';
            
            fetch('/follow/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({
                    'username': username,
                    // Uses the ternary operator to change the status
                    'action': isFollowing ? 'unfollow' : 'follow'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    if (data.following) {
                        followBtn.textContent = 'Unfollow';
                        followBtn.classList.remove('btn-primary');
                        followBtn.classList.add('btn-outline-primary');
                    } else {
                        followBtn.textContent = 'Follow';
                        followBtn.classList.remove('btn-outline-primary');
                        followBtn.classList.add('btn-primary');
                    }
                    
                    updateFollowerCount(data.following);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
});

function updateFollowerCount(isNowFollowing, realCount) {
    const followerCountElement = document.querySelector('#followers');
    
    if (followerCountElement) {
        const currentText = followerCountElement.textContent;
        const currentCount = parseInt(currentText.match(/(\d+)/)[0]);
        
        const newCount = isNowFollowing ? currentCount + 1 : currentCount - 1;
        
        followerCountElement.textContent = currentText.replace(/\d+/, newCount);
    }
}