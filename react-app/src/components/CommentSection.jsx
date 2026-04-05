import { useState, useEffect } from "react";
import "./css files/CommentSection.css";

const API = "http://localhost:3001/api/comments";

// single comment display component
const CommentItem = ({ comment, replies, allComments, onReply, onDelete, isLoggedIn, currentUserId, isAdmin }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const isDeleted = comment.isDeleted;
  const userName = comment.userId?.userName || "Unknown";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // find the user being replied to
  const replyToComment = comment.replyToCommentId
    ? allComments.find((c) => c._id === comment.replyToCommentId)
    : null;

  // find root comment id
  const rootId = comment.parentCommentId || comment._id;

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || replySubmitting) return;
    setReplySubmitting(true);
    await onReply(rootId, comment._id, replyContent.trim());
    setReplyContent("");
    setShowReplyBox(false);
    setReplySubmitting(false);
  };

  const avatarUrl = comment.userId?.avatar
    ? (comment.userId.avatar.startsWith("/uploads/")
      ? `http://localhost:3001${comment.userId.avatar}`
      : comment.userId.avatar)
    : null;

  return (
    <div className="comment-item">
        <div className="comment-header">
          {!isDeleted && avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="comment-avatar-img" />
          ) : (
            <div className="comment-avatar-placeholder" />
          )}
          <span className="comment-author">{isDeleted ? "" : userName}</span>
          {replyToComment && !isDeleted && (
            <>
              <span className="comment-reply-arrow">›</span>
              <span className="comment-reply-target">
                {replyToComment.isDeleted ? "deleted" : (replyToComment.userId?.userName || "Unknown")}
              </span>
            </>
          )}
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        <div className="comment-content">
          {isDeleted ? (
            <span className="comment-deleted">This comment has been deleted</span>
          ) : (
            comment.content
          )}
        </div>

        {isLoggedIn && !isDeleted && (
          <div className="comment-actions">
            <button className="comment-reply-btn" onClick={() => setShowReplyBox(!showReplyBox)}>
              {showReplyBox ? "Cancel" : "Reply"}
            </button>
            {(currentUserId === comment.userId?._id || isAdmin) && (
              <button className="comment-delete-btn" onClick={() => onDelete(comment._id)}>
                Delete
              </button>
            )}
          </div>
        )}

        {showReplyBox && (
          <div className="comment-reply-input">
            <textarea
              className="comment-textarea"
              placeholder={`Reply to ${userName}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
            />
            <button
              className="comment-submit-btn"
              onClick={handleReplySubmit}
              disabled={replySubmitting || !replyContent.trim()}
            >
              {replySubmitting ? "Posting..." : "Reply"}
            </button>
          </div>
        )}

        {replies.length > 0 && (
          <div className="comment-replies">
            {replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                replies={allComments.filter((c) => c.replyToCommentId === reply._id && c._id !== reply._id)}
                allComments={allComments}
                onReply={onReply}
                onDelete={onDelete}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
    </div>
  );
};

export const CommentSection = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentUserId = localStorage.getItem("userId");
  const isLoggedIn = !!currentUserId;
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // fetch comments for this event
  useEffect(() => {
    fetch(`${API}/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  // submit a new root comment
  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          userId: currentUserId,
          content: newComment.trim(),
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [...prev, created]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
    setSubmitting(false);
  };

  // delete a comment
  const handleDelete = async (commentId) => {
    const confirmed = window.confirm("Are you sure to delete this comment?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API}/${commentId}`, { method: "DELETE" });
      if (res.ok) {
        // re-fetch comment
        const updated = await fetch(`${API}/${eventId}`);
        const data = await updated.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // submit reply to a comment
  const handleReply = async (parentCommentId, replyToCommentId, content) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          userId: currentUserId,
          content,
          parentCommentId,
          replyToCommentId,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setComments((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  // separate root comments from replies
  const rootComments = comments.filter((c) => !c.parentCommentId);

  // get direct replies to a root comment (replies whose replyToCommentId is another reply are nested further)
  const getReplies = (parentId) => {
    return comments.filter((c) => c.parentCommentId === parentId);
  };

  if (loading) return <p className="comments-loading">Loading comments...</p>;

  return (
    <div className="comment-section">
      <h2 className="comment-section-title">Comments ({comments.filter((c) => !c.isDeleted).length})</h2>

      {isLoggedIn && (
        <div className="comment-input-box">
          <textarea
            className="comment-textarea"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <button
            className="comment-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      )}

      {rootComments.length === 0 ? (
        <p className="no-comments">No comments yet</p>
      ) : (
        <div className="comment-list">
          {rootComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              replies={getReplies(comment._id)}
              allComments={comments}
              onReply={handleReply}
              onDelete={handleDelete}
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
