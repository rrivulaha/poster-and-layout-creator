/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useEditorStore } from './store/useEditorStore';
import { Dashboard } from './components/dashboard/Dashboard';
import { EditorLayout } from './components/editor/EditorLayout';

export default function App() {
  const { activeScreen, loadProjects } = useEditorStore();

  useEffect(() => {
    // Load existing projects from localStorage on application startup
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="w-screen h-screen bg-stone-50 select-none">
      {activeScreen === 'dashboard' ? (
        <Dashboard />
      ) : (
        <EditorLayout />
      )}
    </div>
  );
}

