/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { PagePreset } from '../../types/canvas';
import { Plus, Trash2, Copy, ExternalLink, Folder } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    loadProjects, 
    createProject,
    projects,
    openProject,
    duplicateProject,
    deleteProject
  } = useEditorStore();

  const [projectName, setProjectName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<PagePreset>('IG_SQUARE');
  const [customWidth, setCustomWidth] = useState('1080');
  const [customHeight, setCustomHeight] = useState('1080');

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    
    let width = 1080;
    let height = 1080;

    if (selectedPreset === 'IG_SQUARE') { width = 1080; height = 1080; }
    else if (selectedPreset === 'IG_PORTRAIT') { width = 1080; height = 1350; }
    else if (selectedPreset === 'STORY') { width = 1080; height = 1920; }
    else if (selectedPreset === 'PRESENTATION') { width = 1920; height = 1080; }
    else if (selectedPreset === 'A4_PORTRAIT') { width = 794; height = 1123; }
    else if (selectedPreset === 'A4_LANDSCAPE') { width = 1123; height = 794; }
    else if (selectedPreset === 'CUSTOM') {
      width = parseInt(customWidth) || 800;
      height = parseInt(customHeight) || 600;
    }

    createProject(projectName || 'Untitled Poster', selectedPreset, width, height);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-6 font-sans text-stone-900 select-none flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        
        {/* 1. Header Banner */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight uppercase">Poster & Layout Creator</h1>
          </div>
          <p className="text-stone-500 text-xs font-medium max-w-md mx-auto leading-relaxed">
            Create beautiful custom posters, cards, slides, and graphics with easy layout controls
          </p>
        </div>

        {/* 2. New Document Card */}
        <div className="bg-white border border-stone-200 shadow-sm rounded-xl p-6">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Plus className="w-4 h-4 text-[#d4af37]" />
            Start a New Blank Canvas
          </h2>
          
          <form onSubmit={handleCreateNew} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600">Project / Document Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Movie Screening Banner..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full mt-1.5 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-stone-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600">Canvas Format Preset</label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value as PagePreset)}
                  className="w-full mt-1.5 border border-stone-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none bg-white"
                >
                  <option value="IG_SQUARE">Instagram Square (1080 × 1080 px)</option>
                  <option value="IG_PORTRAIT">Instagram Portrait (1080 × 1350 px)</option>
                  <option value="STORY">Instagram Story / Reel (1080 × 1920 px)</option>
                  <option value="PRESENTATION">Presentation Slide (1920 × 1080 px)</option>
                  <option value="A4_PORTRAIT">A4 Portrait (794 × 1123 px)</option>
                  <option value="A4_LANDSCAPE">A4 Landscape (1123 × 794 px)</option>
                  <option value="CUSTOM">Custom Sizing (Enter below)</option>
                </select>
              </div>
            </div>

            {selectedPreset === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 border border-stone-200/60 rounded-lg animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Width (pixels)</label>
                  <input 
                    type="number" 
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-full mt-1 border border-stone-200 rounded-md px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">Height (pixels)</label>
                  <input 
                    type="number" 
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-full mt-1 border border-stone-200 rounded-md px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow mt-2 cursor-pointer"
            >
              Create New Empty Project
            </button>
          </form>
        </div>

        {/* 3. Saved Canvases Section */}
        {projects.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
              <Folder className="w-4 h-4 text-[#d4af37]" />
              Your Saved Canvases ({projects.length})
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((project) => {
                const dateStr = new Date(project.updatedAt || project.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div 
                    key={project.id}
                    className="bg-white border border-stone-200 shadow-xs hover:shadow-md hover:border-stone-300 rounded-xl p-4 transition-all flex flex-col justify-between group animate-fade-in"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-stone-800 group-hover:text-[#d4af37] transition-colors truncate flex-1">
                          {project.name}
                        </h3>
                        <span className="text-[9px] font-mono font-bold bg-amber-50 text-[#d4af37] px-1.5 py-0.5 rounded uppercase shrink-0">
                          {project.preset.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-stone-400 font-medium">
                        Dimensions: {project.width} × {project.height} {project.unit || 'px'}
                      </p>
                      
                      <p className="text-[10px] text-stone-400 font-medium">
                        Last edited: {dateStr}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => duplicateProject(project.id)}
                        className="p-1.5 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-all border border-transparent hover:border-stone-200 cursor-pointer"
                        title="Duplicate Project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteProject(project.id);
                          }
                        }}
                        className="p-1.5 rounded-md text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openProject(project.id)}
                        className="py-1.5 px-3 bg-stone-900 hover:bg-[#d4af37] hover:text-white text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer ml-1 shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open Editor
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
