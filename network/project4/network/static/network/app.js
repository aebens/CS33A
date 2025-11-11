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

// Edit post -- all three buttons are in this listener (edit, save, cancel)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit-btn')) {
        const postId = e.target.dataset.postId;
        const post = e.target.closest('.post');
        const content = post.querySelector('p');
        const originalText = content.textContent;
        
        // Replace paragraph with edit functions
        content.innerHTML = `
            <textarea class="form-control" rows="3">${originalText}</textarea>
            <button class="btn btn-primary btn-sm mt-2 save-btn" data-post-id="${postId}">Save</button>
            <button class="btn btn-secondary btn-sm mt-2 cancel-btn">Cancel</button>
        `;
        e.target.style.display = 'none';
    }
    
    if (e.target.classList.contains('save-btn')) {
        const postId = e.target.dataset.postId;
        const post = e.target.closest('.post');
        const textarea = post.querySelector('textarea');
        const newContent = textarea.value;

        const csrfToken = document.getElementById('csrf-token')?.value;
        
        fetch('/edit_post/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({post_id: postId, content: newContent})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                post.querySelector('p').textContent = newContent;
                post.querySelector('.edit-btn').style.display = 'inline-block';
            }
        });
    }
    
    if (e.target.classList.contains('cancel-btn')) {
        location.reload();
    }
});