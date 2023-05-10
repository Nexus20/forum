document.addEventListener('DOMContentLoaded', () => {
    const postId = window.location.pathname.split('/')[2];
    const editCommentModal = new bootstrap.Modal(document.getElementById('editCommentModal'));
    const deleteCommentModal = new bootstrap.Modal(document.getElementById('deleteCommentModal'));
    let currentCommentId;

    document.querySelectorAll('.edit-comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const commentId = e.target.dataset.commentId;
            currentCommentId = commentId;
            const commentText = document.getElementById(`comment-text-${commentId}`).textContent;
            document.getElementById('editCommentTextarea').value = commentText;
        });
    });

    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentCommentId = e.target.dataset.commentId;
        });
    });

    document.getElementById('editCommentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newText = document.getElementById('editCommentTextarea').value;
        await fetch(`/posts/${postId}/comments/${currentCommentId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: newText}),
        });
        document.getElementById(`comment-text-${currentCommentId}`).textContent = newText;
        editCommentModal.hide();
    });

    document.getElementById('deleteCommentBtn').addEventListener('click', async () => {
        await fetch(`/posts/${postId}/comments/${currentCommentId}`, {
            method: 'DELETE',
        });
        document.getElementById(`comment-${currentCommentId}`).remove();
        deleteCommentModal.hide();
    });
});