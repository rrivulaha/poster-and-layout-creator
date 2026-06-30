/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../../store/useEditorStore';
import { SidebarLeft } from './SidebarLeft';
import { CanvasWorkspace } from './CanvasWorkspace';
import { PropertyInspector } from './PropertyInspector';
import { ArrowLeft, ZoomIn, ZoomOut, Save, Download, RefreshCw, Layers, Sliders, Check } from 'lucide-react';

export const EditorLayout: React.FC = () => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [customWidthInput, setCustomWidthInput] = useState('');
  const [leftOpen, setLeftOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [rightOpen, setRightOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);
  
  // Export success state
  const [exportSuccessModal, setExportSuccessModal] = useState(false);
  const [exportedDetails, setExportedDetails] = useState({ filename: '', dims: '' });

  const { 
    activeProjectId, 
    projects, 
    setScreen, 
    zoomRatio, 
    setZoomRatio,
    updateActiveProjectName,
    canvasVersion
  } = useEditorStore();

  const currentProject = projects.find(p => p.id === activeProjectId);

  const projWidth = currentProject?.width || 800;
  const projHeight = currentProject?.height || 600;
  const aspect = projWidth / projHeight;

  // Compute values for custom resolution export
  const activeCustomWidth = customWidthInput ? Math.max(10, parseInt(customWidthInput) || projWidth * 2) : projWidth * 2;
  const activeCustomHeight = Math.round(activeCustomWidth / aspect);
  const activeMultiplier = activeCustomWidth / projWidth;

  const handleExport = (multiplier: number) => {
    if (!canvasRef.current) return;
    
    // Deselect active element to avoid exporting with guidelines
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();

    const format = 'png';
    const dataUrl = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: multiplier
    });

    const link = document.createElement('a');
    const filename = `${currentProject?.name || 'poster_export'}_${Math.round(projWidth * multiplier)}x${Math.round(projHeight * multiplier)}.png`;
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save state for confirmation modal
    setExportedDetails({
      filename,
      dims: `${Math.round(projWidth * multiplier)} × ${Math.round(projHeight * multiplier)} px`
    });
    setExportSuccessModal(true);
  };

  const handleExportSVG = () => {
    if (!canvasRef.current) return;
    canvasRef.current.discardActiveObject();
    canvasRef.current.renderAll();

    const svgString = canvasRef.current.toSVG();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const filename = `${currentProject?.name || 'poster_export'}.svg`;
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Save state for confirmation modal
    setExportedDetails({
      filename,
      dims: `Scalable Vector Graphic (SVG)`
    });
    setExportSuccessModal(true);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-stone-50 overflow-hidden font-sans text-stone-950">
      {/* 1. Header Toolbar */}
      <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button */}
          <button 
            onClick={() => setScreen('dashboard')}
            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all shrink-0 cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <hr className="h-4 w-px bg-stone-200 shrink-0" />

          {/* Title edit input */}
          <input 
            type="text" 
            value={currentProject?.name || ''}
            onChange={(e) => updateActiveProjectName(e.target.value)}
            className="font-bold text-sm text-stone-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#d4af37] focus:outline-none px-1 py-0.5 transition-all max-w-[100px] sm:max-w-xs truncate"
            placeholder="Edit project title..."
            title="Double-click to edit project name"
          />

          <hr className="h-4 w-px bg-stone-200 shrink-0" />

          {/* Left Sidebar Toggle Button */}
          <button
            onClick={() => setLeftOpen(!leftOpen)}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 px-2.5 shrink-0 text-xs font-semibold cursor-pointer ${
              leftOpen 
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs' 
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-50'
            }`}
            title="Toggle Left Sidebar (Layers & Assets)"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden md:inline">Layers & Assets</span>
          </button>
        </div>

        {/* 2. Header Right Side toggles */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Right Sidebar Toggle Button */}
          <button
            onClick={() => setRightOpen(!rightOpen)}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 px-2.5 shrink-0 text-xs font-semibold cursor-pointer ${
              rightOpen 
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs' 
                : 'bg-white text-stone-600 border-stone-200 hover:text-stone-900 hover:bg-stone-50'
            }`}
            title="Toggle Right Sidebar (Properties)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold hidden md:inline">Properties</span>
          </button>
        </div>
      </header>

      {/* 3. Core Workspace Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar backdrop for mobile/tablet screens */}
        {leftOpen && (
          <div 
            className="fixed inset-0 bg-stone-950/30 backdrop-blur-xs z-30 lg:hidden transition-all duration-300"
            onClick={() => setLeftOpen(false)}
          />
        )}

        {/* Left side actions and Layers panel - Slides from Left on Mobile */}
        <div 
          className={`h-full border-r border-stone-200 bg-white transition-transform duration-300 ease-in-out z-40 flex flex-col select-none shrink-0 w-80 lg:relative lg:z-0 fixed inset-y-0 left-0 lg:translate-x-0 lg:shadow-none shadow-2xl ${
            leftOpen 
              ? 'translate-x-0' 
              : '-translate-x-full'
          }`}
        >
          <SidebarLeft canvasRef={canvasRef} />
        </div>

        {/* Center Canvas container area */}
        <CanvasWorkspace canvasRef={canvasRef} />

        {/* Right Sidebar backdrop for mobile/tablet screens */}
        {rightOpen && (
          <div 
            className="fixed inset-0 bg-stone-950/30 backdrop-blur-xs z-30 xl:hidden transition-all duration-300"
            onClick={() => setRightOpen(false)}
          />
        )}

        {/* Right contextual properties inspector - Slides from Right on Mobile */}
        <div 
          className={`h-full border-l border-stone-200 bg-white transition-transform duration-300 ease-in-out z-40 flex flex-col select-none shrink-0 w-72 xl:relative xl:z-0 fixed inset-y-0 right-0 xl:translate-x-0 xl:shadow-none shadow-2xl ${
            rightOpen 
              ? 'translate-x-0' 
              : 'translate-x-full'
          }`}
        >
          <PropertyInspector canvasRef={canvasRef} />
        </div>
      </div>

      {/* 4. Bottom Status & Control Bar */}
      <footer className="h-14 border-t border-stone-200 bg-white flex items-center justify-between px-4 select-none shrink-0 z-10 flex-wrap gap-2 py-2">
        {/* Status indicator / metadata */}
        <div className="flex items-center gap-2 text-stone-500 text-[11px] font-medium min-w-0">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
          <span className="truncate font-bold text-stone-600">
            {currentProject?.width} × {currentProject?.height} px • High-Res Canvas Ready
          </span>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
          <button 
            onClick={() => setZoomRatio(Math.max(0.1, zoomRatio - 0.1))}
            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-stone-600 min-w-12 text-center select-none">
            {Math.round(zoomRatio * 100)}%
          </span>
          <button 
            onClick={() => setZoomRatio(Math.min(3.0, zoomRatio + 0.1))}
            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-white transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Export/Publish Dropdown Trigger */}
        <div className="relative">
          <button 
            onClick={() => setExportOpen(!exportOpen)}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-[#d4af37] hover:bg-[#c29f2f] text-white font-bold text-xs rounded-lg shadow-sm transition-all focus:outline-none cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Publish & Export</span>
          </button>
          
          {/* Export Dropdown Menu */}
          {exportOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setExportOpen(false)} 
              />
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1.5 w-64 bg-white border border-stone-200 rounded-lg shadow-xl py-1 z-50 flex flex-col"
              >
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">Quick Presets</div>
                <button
                  onClick={() => {
                    handleExport(1);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex flex-col cursor-pointer"
                >
                  <span className="font-bold">Standard Image (1x PNG)</span>
                  <span className="text-[9px] text-stone-400 font-normal">Optimal for screen, email & chats</span>
                </button>
                <button
                  onClick={() => {
                    handleExport(2.0);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex flex-col border-t border-stone-100 cursor-pointer"
                >
                  <span className="font-bold text-stone-800">High-Res Print (2x PNG)</span>
                  <span className="text-[9px] text-[#d4af37] font-semibold">Perfect for printing & posters</span>
                </button>
                <button
                  onClick={() => {
                    handleExport(3.0);
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex flex-col border-t border-stone-100 cursor-pointer"
                >
                  <span className="font-bold">Ultra-Res Print (3x PNG)</span>
                  <span className="text-[9px] text-stone-400 font-normal">Large scale print banners</span>
                </button>
                <button
                  onClick={() => {
                    handleExportSVG();
                    setExportOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex flex-col border-t border-stone-100 cursor-pointer"
                >
                  <span className="font-bold">Scalable Vector Graphic (SVG)</span>
                  <span className="text-[9px] text-stone-400 font-normal">Editable in Figma & Illustrator</span>
                </button>

                {/* Custom Resolution Section */}
                <div className="p-3 border-t border-stone-150 bg-stone-50 rounded-b-lg space-y-2">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Custom Resolution</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[9px] text-stone-500 font-bold block mb-0.5">Width (px)</label>
                      <input
                        type="number"
                        placeholder={`${projWidth * 2}`}
                        value={customWidthInput}
                        onChange={(e) => setCustomWidthInput(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div className="shrink-0 text-stone-400 text-xs pt-3 font-bold">×</div>
                    <div className="flex-1">
                      <label className="text-[9px] text-stone-500 font-bold block mb-0.5">Height (px)</label>
                      <input
                        type="text"
                        disabled
                        value={activeCustomHeight}
                        className="w-full bg-stone-100 border border-stone-200 rounded px-2 py-1 text-xs font-semibold text-stone-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-stone-400 font-medium px-0.5">
                    <span>Multiplier:</span>
                    <strong className="text-stone-600">{activeMultiplier.toFixed(2)}x</strong>
                  </div>
                  <button
                    onClick={() => {
                      handleExport(activeMultiplier);
                      setExportOpen(false);
                    }}
                    className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded font-bold text-[10px] text-center transition-all cursor-pointer uppercase tracking-wider shadow-sm"
                  >
                    Publish Custom Resolution
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </footer>

      {/* 5. Beautiful Export Confirmation Modal */}
      {exportSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Graphic icon */}
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200/50 shadow-inner">
              <Check className="w-7 h-7 text-[#d4af37]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">Export & Compile Complete!</h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your asset has been built and downloaded successfully.
              </p>
            </div>

            {/* Compiled Info Card */}
            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 w-full text-left space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <span>File Format</span>
                <span className="font-mono text-stone-600 text-right">
                  {exportedDetails.filename.endsWith('.svg') ? 'SVG Vector' : 'PNG Image'}
                </span>
              </div>
              <div className="truncate text-xs font-bold text-stone-700 font-mono" title={exportedDetails.filename}>
                {exportedDetails.filename}
              </div>
              <div className="text-[10px] font-bold text-[#d4af37] bg-amber-50 px-2 py-0.5 rounded inline-block">
                {exportedDetails.dims}
              </div>
            </div>

            {/* Action Buttons to go back to Canvas */}
            <div className="w-full pt-2">
              <button
                onClick={() => setExportSuccessModal(false)}
                className="w-full py-2.5 px-4 bg-[#d4af37] hover:bg-[#c29f2f] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Proceed to Back to Canvas
              </button>
              <button
                onClick={() => {
                  setExportSuccessModal(false);
                  setScreen('dashboard');
                }}
                className="w-full mt-2 py-2 px-4 hover:bg-stone-50 text-stone-500 font-semibold text-xs rounded-lg transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
