/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Project, PagePreset, Page, AVFIObject } from '../types/canvas';

interface EditorState {
  projects: Project[];
  activeProjectId: string | null;
  activeScreen: 'dashboard' | 'editor';
  selectedObjectId: string | null;
  selectedObjectType: string | null;
  canvasVersion: number;
  zoomRatio: number;
  gridEnabled: boolean;
  snapEnabled: boolean;
  
  // Navigation & Project management
  setScreen: (screen: 'dashboard' | 'editor') => void;
  loadProjects: () => void;
  createProject: (name: string, preset: PagePreset, width: number, height: number, unit?: 'px' | 'mm') => Project;
  openProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  updateActiveProjectName: (name: string) => void;
  updateActiveProjectPageBg: (color: string) => void;
  updateActiveProjectDimensions: (preset: PagePreset, width: number, height: number) => void;
  saveActiveProjectToStorage: (serializedPages: any[]) => void;
  
  // Selection and Canvas State
  setSelectedObjectId: (id: string | null, type?: string | null) => void;
  triggerCanvasRefresh: () => void;
  setZoomRatio: (ratio: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
}

const PRESET_DIMENSIONS: Record<PagePreset, { width: number; height: number }> = {
  IG_SQUARE: { width: 1080, height: 1080 },
  IG_PORTRAIT: { width: 1080, height: 1350 },
  STORY: { width: 1080, height: 1920 },
  PRESENTATION: { width: 1920, height: 1080 },
  A4_PORTRAIT: { width: 794, height: 1123 }, // 96 DPI approximations
  A4_LANDSCAPE: { width: 1123, height: 794 },
  CUSTOM: { width: 800, height: 600 }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activeScreen: 'dashboard',
  selectedObjectId: null,
  selectedObjectType: null,
  canvasVersion: 0,
  zoomRatio: 1,
  gridEnabled: false,
  snapEnabled: true,

  setScreen: (screen) => set({ activeScreen: screen }),

  loadProjects: () => {
    try {
      const saved = localStorage.getItem('avfi_projects_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ projects: parsed });
      } else {
        set({ projects: [] });
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  },

  createProject: (name, preset, width, height, unit = 'px') => {
    const finalWidth = width || PRESET_DIMENSIONS[preset]?.width || 800;
    const finalHeight = height || PRESET_DIMENSIONS[preset]?.height || 600;
    
    const newPage: Page = {
      id: `page_${Date.now()}`,
      name: 'Page 1',
      width: finalWidth,
      height: finalHeight,
      backgroundColor: '#ffffff',
      objects: []
    };

    const newProject: Project = {
      id: `project_${Date.now()}`,
      name: name || 'Untitled Project',
      preset,
      width: finalWidth,
      height: finalHeight,
      unit,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: [newPage],
      activePageIndex: 0
    };

    const updatedProjects = [newProject, ...get().projects];
    set({ projects: updatedProjects, activeProjectId: newProject.id, activeScreen: 'editor' });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
    return newProject;
  },

  openProject: (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({ activeProjectId: id, activeScreen: 'editor', selectedObjectId: null, selectedObjectType: null });
    }
  },

  duplicateProject: (id) => {
    const target = get().projects.find(p => p.id === id);
    if (!target) return;

    const duplicated: Project = {
      ...target,
      id: `project_${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      // Deep copy pages if needed, but since it's JSON serialization we can parse/stringify
      pages: JSON.parse(JSON.stringify(target.pages))
    };

    const updatedProjects = [duplicated, ...get().projects];
    set({ projects: updatedProjects });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
  },

  deleteProject: (id) => {
    const updatedProjects = get().projects.filter(p => p.id !== id);
    set({ 
      projects: updatedProjects, 
      activeProjectId: get().activeProjectId === id ? null : get().activeProjectId,
      activeScreen: get().activeProjectId === id ? 'dashboard' : get().activeScreen
    });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
  },

  updateActiveProjectName: (name) => {
    const { activeProjectId, projects } = get();
    if (!activeProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, name, updatedAt: Date.now() };
      }
      return p;
    });

    set({ projects: updatedProjects });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
  },

  updateActiveProjectPageBg: (color) => {
    const { activeProjectId, projects } = get();
    if (!activeProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        const pages = p.pages.map((page, idx) => {
          if (idx === p.activePageIndex) {
            return { ...page, backgroundColor: color };
          }
          return page;
        });
        return { ...p, pages, updatedAt: Date.now() };
      }
      return p;
    });

    set({ projects: updatedProjects });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
    get().triggerCanvasRefresh();
  },

  updateActiveProjectDimensions: (preset, width, height) => {
    const { activeProjectId, projects } = get();
    if (!activeProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        const pages = p.pages.map((page, idx) => {
          if (idx === p.activePageIndex) {
            return { ...page, width, height };
          }
          return page;
        });
        return { ...p, preset, width, height, pages, updatedAt: Date.now() };
      }
      return p;
    });

    set({ projects: updatedProjects });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
    get().triggerCanvasRefresh();
  },

  saveActiveProjectToStorage: (serializedPages) => {
    const { activeProjectId, projects } = get();
    if (!activeProjectId) return;

    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        const pages = p.pages.map((page, idx) => {
          if (idx === p.activePageIndex) {
            return {
              ...page,
              objects: serializedPages
            };
          }
          return page;
        });
        return { 
          ...p, 
          pages, 
          updatedAt: Date.now()
        };
      }
      return p;
    });

    set({ projects: updatedProjects });
    localStorage.setItem('avfi_projects_list', JSON.stringify(updatedProjects));
  },

  setSelectedObjectId: (id, type = null) => {
    set({ selectedObjectId: id, selectedObjectType: type });
  },

  triggerCanvasRefresh: () => {
    set((state) => ({ canvasVersion: state.canvasVersion + 1 }));
  },

  setZoomRatio: (ratio) => set({ zoomRatio: Math.max(0.1, Math.min(4, ratio)) }),
  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled }))
}));
