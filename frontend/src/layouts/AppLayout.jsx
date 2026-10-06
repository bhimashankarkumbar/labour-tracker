import React from 'react';
import Sidebar from '../components/layout/Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="pl-64">
        <div className="p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
