import React from 'react';

function Sidebar({ users, selfId, activeUser, onSelectUser, onSelectGroup, connectionStatus }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Users</h3>
        <div className="conn-status">
          <span className={`status-dot ${connectionStatus}`}></span>
          <small>{connectionStatus}</small>
        </div>
      </div>
      <button
        className={`sidebar-item ${!activeUser ? 'active' : ''}`}
        onClick={onSelectGroup}
      >
        🌐 Group Chat
      </button>
      <div className="user-list">
        {users.filter(u => u.clientId !== selfId).length === 0 && (
          <div className="sidebar-empty">No other users online</div>
        )}
        {users.filter(u => u.clientId !== selfId).map(u => (
          <button
            key={u.clientId}
            className={`sidebar-item ${activeUser && activeUser.clientId === u.clientId ? 'active' : ''}`}
            onClick={() => onSelectUser(u)}
          >
            👤 {u.username}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
