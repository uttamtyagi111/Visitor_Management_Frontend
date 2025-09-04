import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import Visitors from './Visitors';
import Invitees from './Invitees';
import Reports from './Reports';
import Settings from './Settings';

function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/visitors" element={<Visitors />} />
          <Route path="/invitees" element={<Invitees />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings/*" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;