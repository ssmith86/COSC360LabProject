import { useState, useEffect } from "react";
import "./css files/CommentSection.css";

const API = "http://localhost:3001/api/comments";

// single comment display component
const CommentItem = ({ comment, replies, allComments }) => {
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

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="comment-author">{isDeleted ? "" : userName}</span>
        <span className="comment-date">{formatDate(comment.createdAt)}</span>
      </div>
      <div className="comment-content">
        {isDeleted ? (
          <span className="comment-deleted">This comment has been deleted</span>
        ) : (
          <>
            {replyToComment && (
              <span className="comment-reply-to">
                @{replyToComment.isDeleted ? "deleted" : (replyToComment.userId?.userName || "Unknown")}
              </span>
            )}
            {comment.content}
          </>
        )}
      </div>

      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replies={allComments.filter((c) => c.replyToCommentId === reply._id && c._id !== reply._id)}
              allComments={allComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

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
            />
          ))}
        </div>
      )}
    </div>
  );
};
