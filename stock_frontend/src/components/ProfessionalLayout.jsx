import React, { useState } from 'react';
import './ProfessionalLayout.css';

export default function ProfessionalLayout({ children, activeTab, onTabChange, stats }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'branches', label: '🏢 Branches', icon: '🏢' },
    { id: 'products', label: '📦 Products', icon: '📦' },
    { id: 'inventory', label: '📈 Inventory', icon: '📈' },
    { id: 'sales', label: '🛒 Sales', icon: '🛒' },
    { id: 'requests', label: '📋 Requests', icon: '📋' },
    { id: 'transfers', label: '🔄 Transfers', icon: '🔄' },
    { id: 'customers', label: '👥 Customers', icon: '👥' },
    { id: 'history', label: '📜 History', icon: '📜' },
    { id: 'admin', label: '⚙️ Admin', icon: '⚙️' }
  ];

  return (
    <div id="shell" className="professional-shell">
      {/* Sidebar */}
      <div id="sidebar" className={`professional-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <span>🌱</span>
          </div>
          <div>
            <div className="brand-name">HGT System</div>
            <div className="brand-sub">Inventory Management</div>
          </div>
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              onTabChange(tab.id);
              setSidebarOpen(false);
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label.split(' ').slice(1).join(' ')}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div id="main" className="professional-main">
        {/* Top Bar */}
        <div id="topbar" className="professional-topbar">
          <button
            id="menuBtn"
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="topbar-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className="spacer"></div>
          <div className="member-chip" onClick={() => setMemberMenuOpen(!memberMenuOpen)}>
            <div className="member-avatar">U</div>
            <div>
              <div className="member-chip-name">User</div>
              <div className="member-chip-role">Admin</div>
            </div>
            <div className="member-menu" style={{ display: memberMenuOpen ? 'block' : 'none' }}>
              <button>Profile</button>
              <button>Settings</button>
              <button>Logout</button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div id="app" className="professional-app">
          {children}
        </div>
      </div>

      {/* Mobile Sidebar Scrim */}
      <div
        className="sidebar-scrim"
        style={{ display: sidebarOpen ? 'block' : 'none' }}
        onClick={() => setSidebarOpen(false)}
      ></div>
    </div>
  );
}
