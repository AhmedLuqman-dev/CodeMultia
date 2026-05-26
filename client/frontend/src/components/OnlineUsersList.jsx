import React from "react";
import "../styles/OnlineUsersList.css";

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.trim()[0] || "?").toUpperCase();
}

const OnlineUsersList = ({ users, currentUsername, compact = false }) => {
  const count = users.length;

  return (
    <div className={`online-users${compact ? " online-users--compact" : ""}`}>
      <div className="online-users-header">
        <span className="online-users-dot" aria-hidden="true" />
        <span className="online-users-title">Online</span>
        <span className="online-users-count">{count}</span>
      </div>

      {count === 0 ? (
        <p className="online-users-empty">Waiting for collaborators…</p>
      ) : (
        <ul className="online-users-list">
          {users.map((user) => {
            const isYou = user.name === currentUsername;
            return (
              <li
                key={user.id}
                className={`online-user-card${isYou ? " is-you" : ""}`}
              >
                <span className="online-user-avatar" aria-hidden="true">
                  {getInitials(user.name)}
                </span>
                <div className="online-user-info">
                  <span className="online-user-name">{user.name}</span>
                  {isYou && <span className="online-user-tag">You</span>}
                </div>
                <span className="online-user-status" title="Connected" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OnlineUsersList;
