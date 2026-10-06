import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store/useStore';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import Tasks from './pages/Tasks';
import Ideas from './pages/Ideas';
import Notebooks from './pages/Notebooks';
import NotebookDetail from './pages/NotebookDetail';
import Scripts from './pages/Scripts';
import ScriptEditor from './pages/ScriptEditor';
import ContentTracker from './pages/ContentTracker';
import CalendarPage from './pages/CalendarPage';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="today" element={<Today />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="ideas" element={<Ideas />} />
              <Route path="notebooks" element={<Notebooks />} />
              <Route path="notebooks/:id" element={<NotebookDetail />} />
              <Route path="scripts" element={<Scripts />} />
              <Route path="scripts/:id" element={<ScriptEditor />} />
              <Route path="content" element={<ContentTracker />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}

export default App;
