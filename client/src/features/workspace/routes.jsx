import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentWorkspace from './pages/StudentWorkspace';

const WorkspaceRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentWorkspace />} />
      <Route path="/:channelId" element={<StudentWorkspace />} />
    </Routes>
  );
};

export default WorkspaceRoutes;
