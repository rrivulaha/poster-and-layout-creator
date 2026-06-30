/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../../store/useEditorStore';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2, Copy, Grid, Compass, Sparkles, Palette, Settings, Type } from 'lucide-react';
import { TiptapEditor } from './TiptapEditor';
import { renderHtmlToDataUrl, RichTextStyleOptions, DEFAULT_RICH_TEXT_STYLES } from '../../utils/svgRenderer';

interface PropertyInspectorProps {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({ canvasRef }) => {
  const { 
    selectedObjectId, 
    selectedObjectType,
    canvasVersion,
    triggerCanvasRefresh,
    saveActiveProjectToStorage,
    gridEnabled,
    toggleGrid,
    snapEnabled,
    toggleSnap,
    updateActiveProjectPageBg,
    activeProjectId,
    projects
  } = useEditorStore();

  const canvas = canvasRef.current;
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activePage = activeProject?.pages[activeProject?.activePageIndex || 0];

  const selectedObject = canvas?.getActiveObject();

  // Helper to safely apply values to active fabric elements and serialize updates
  const updateValue = (key: string, value: any) => {
    if (!selectedObject || !canvas) return;
    
    selectedObject.set(key, value);
    canvas.renderAll();
    triggerCanvasRefresh();

    // Auto save
    saveActiveProjectToStorage(canvas.toJSON().objects || []);
  };

  const handleDuplicate = () => {
    if (!selectedObject || !canvas) return;
    selectedObject.clone().then((cloned) => {
      cloned.set({
        left: (selectedObject.left || 0) + 30,
        top: (selectedObject.top || 0) + 30,
        id: `obj_${Date.now()}`
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      triggerCanvasRefresh();
    });
  };

  const handleDelete = () => {
    if (!selectedObject || !canvas) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    triggerCanvasRefresh();
  };

  // 1. Canvas Settings (Show when no object is selected)
  if (!selectedObject) {
    return (
      <div className="w-full h-full bg-white border-l border-stone-200 flex flex-col select-none p-4">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Canvas Settings</h3>
        
        <div className="space-y-4">
          {/* Preset details read-only */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Preset Dimensions</label>
            <div className="mt-1 p-2 bg-stone-50 border border-stone-100 rounded text-xs font-semibold text-stone-700">
              {activeProject?.preset.replace('_', ' ')} ({activeProject?.width} × {activeProject?.height} {activeProject?.unit})
            </div>
          </div>

          {/* Canvas Backdrop Fill Color */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Page Background Color</label>
            <div className="flex items-center gap-2 mt-1">
              <input 
                type="color" 
                value={activePage?.backgroundColor || '#ffffff'}
                onChange={(e) => {
                  updateActiveProjectPageBg(e.target.value);
                  if (canvas) {
                    canvas.backgroundColor = e.target.value;
                    canvas.renderAll();
                  }
                }}
                className="w-8 h-8 rounded border border-stone-200 cursor-pointer p-0"
              />
              <span className="text-xs font-mono uppercase text-stone-600">
                {activePage?.backgroundColor || '#ffffff'}
              </span>
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Workspace Controls */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Guides & Layout Rules</h4>
            
            {/* Grid Toggle */}
            <button
              onClick={toggleGrid}
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                gridEnabled 
                  ? 'bg-amber-50/50 border-[#d4af37] text-stone-800' 
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <Grid className="w-3.5 h-3.5 text-stone-500" />
                Show Grid Lines
              </span>
              <span className="text-[10px] text-stone-400 uppercase">{gridEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* Snap Guides Toggle */}
            <button
              onClick={toggleSnap}
              className={`w-full p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                snapEnabled 
                  ? 'bg-amber-50/50 border-[#d4af37] text-stone-800' 
                  : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-stone-500" />
                Magnetic Snapping
              </span>
              <span className="text-[10px] text-stone-400 uppercase">{snapEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="pt-8">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-[11px] text-stone-500 leading-relaxed italic text-center">
              Select any textbox or image element on the canvas to configure properties or rearrange layers.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Common properties extraction
  const left = Math.round(selectedObject.left || 0);
  const top = Math.round(selectedObject.top || 0);
  const scaleX = selectedObject.scaleX || 1;
  const scaleY = selectedObject.scaleY || 1;
  const width = Math.round((selectedObject.width || 0) * scaleX);
  const height = Math.round((selectedObject.height || 0) * scaleY);
  const angle = Math.round(selectedObject.angle || 0);
  const opacity = selectedObject.opacity || 1;

  const isRichText = (selectedObject as any).isRichText === true || selectedObject.get('isRichText') === true;
  const isText = (selectedObject.type === 'textbox' || selectedObject.type?.includes('text')) && !isRichText;
  const isImage = selectedObject.type === 'image' && !isRichText;

  // Helper to re-render and update custom rich-text block
  const updateRichText = (htmlContent: string, styleOptions?: Partial<RichTextStyleOptions>) => {
    if (!selectedObject || !canvas) return;

    const currentHtml = htmlContent;
    const currentStyles = {
      ...DEFAULT_RICH_TEXT_STYLES,
      ...((selectedObject as any).styleOptions || {}),
      ...styleOptions
    };

    // Save custom properties on the object
    (selectedObject as any).htmlContent = currentHtml;
    (selectedObject as any).styleOptions = currentStyles;

    // Use current dimensions of the object
    const objWidth = selectedObject.width || 380;
    const objHeight = selectedObject.height || 230;

    const dataUrl = renderHtmlToDataUrl(currentHtml, objWidth, objHeight, currentStyles);

    (selectedObject as fabric.Image).setSrc(dataUrl).then(() => {
      canvas.renderAll();
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    });
  };

  return (
    <div className="w-full h-full bg-white border-l border-stone-200 flex flex-col select-none p-4 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-3.5">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
          Properties ({selectedObject.type})
        </h3>
        <span className="text-[10px] font-mono font-bold bg-amber-50 text-[#d4af37] px-1.5 py-0.5 rounded uppercase">
          {selectedObject.get('name') || selectedObject.type}
        </span>
      </div>

      <div className="space-y-4">
        {/* TIPTAP RICH TEXT PROPERTIES VIEW */}
        {isRichText && (
          <div className="space-y-4">
            {/* Tiptap Rich Text Composition */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#d4af37]" />
                Rich Text Editor
              </label>
              <TiptapEditor 
                value={(selectedObject as any).htmlContent || ''} 
                onChange={(html) => updateRichText(html)} 
              />
            </div>

            {/* Typography Styling Section */}
            <div className="border border-stone-100 rounded-lg p-3 bg-stone-50/50 space-y-3.5">
              <div className="flex items-center gap-1 pb-1 border-b border-stone-100">
                <Type className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Text Styling</span>
              </div>

              {/* Font Family Selection */}
              <div>
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Font Family</label>
                <select
                  value={((selectedObject as any).styleOptions?.fontFamily) || 'Inter, sans-serif'}
                  onChange={(e) => updateRichText((selectedObject as any).htmlContent, { fontFamily: e.target.value })}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold focus:outline-none bg-white text-stone-700"
                >
                  <option value="Inter, sans-serif">Sans-Serif (Inter)</option>
                  <option value="'Playfair Display', Georgia, serif">Serif (Playfair Display)</option>
                  <option value="'Dancing Script', cursive">Cursive (Dancing Script)</option>
                  <option value="Georgia, serif">Serif (Classic Georgia)</option>
                  <option value="'Courier New', Courier, monospace">Monospace (Courier)</option>
                </select>
              </div>

              {/* Font Size & Text Color */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Font Size</label>
                  <select
                    value={((selectedObject as any).styleOptions?.fontSize) || '18px'}
                    onChange={(e) => updateRichText((selectedObject as any).htmlContent, { fontSize: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold bg-white text-stone-700"
                  >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                    <option value="28px">28px</option>
                    <option value="32px">32px</option>
                    <option value="36px">36px</option>
                    <option value="42px">42px</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Text Color</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color"
                      value={((selectedObject as any).styleOptions?.color) || '#111111'}
                      onChange={(e) => updateRichText((selectedObject as any).htmlContent, { color: e.target.value })}
                      className="w-8 h-8 rounded border border-stone-200 cursor-pointer p-0 shrink-0"
                    />
                    <span className="text-[9px] font-mono uppercase text-stone-600 shrink-0">
                      {((selectedObject as any).styleOptions?.color) || '#111111'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Align & Line Height */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Line Height</label>
                  <select
                    value={((selectedObject as any).styleOptions?.lineHeight) || '1.6'}
                    onChange={(e) => updateRichText((selectedObject as any).htmlContent, { lineHeight: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold bg-white text-stone-700"
                  >
                    <option value="1.2">1.2 (Tight)</option>
                    <option value="1.4">1.4 (Standard)</option>
                    <option value="1.6">1.6 (Relaxed)</option>
                    <option value="1.8">1.8 (Wide)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Align Text</label>
                  <div className="flex items-center gap-0.5 mt-1 border border-stone-200 rounded p-0.5 bg-white">
                    {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                      const isSelected = (((selectedObject as any).styleOptions?.textAlign) || 'left') === align;
                      return (
                        <button
                          key={align}
                          onClick={() => updateRichText((selectedObject as any).htmlContent, { textAlign: align })}
                          className={`flex-1 py-1 rounded flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-amber-500/15 text-[#d4af37]' 
                              : 'text-stone-400 hover:text-stone-700'
                          }`}
                        >
                          {align === 'left' && <AlignLeft className="w-3 h-3" />}
                          {align === 'center' && <AlignCenter className="w-3 h-3" />}
                          {align === 'right' && <AlignRight className="w-3 h-3" />}
                          {align === 'justify' && <AlignJustify className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Container Layout Section */}
            <div className="border border-stone-100 rounded-lg p-3 bg-stone-50/50 space-y-3.5">
              <div className="flex items-center gap-1 pb-1 border-b border-stone-100">
                <Palette className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Frame Container</span>
              </div>

              {/* Background Color & Padding */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Frame Fill</label>
                  <div className="flex items-center gap-1 mt-1">
                    <input 
                      type="color"
                      value={((selectedObject as any).styleOptions?.backgroundColor) === 'transparent' ? '#ffffff' : ((selectedObject as any).styleOptions?.backgroundColor) || '#ffffff'}
                      onChange={(e) => updateRichText((selectedObject as any).htmlContent, { backgroundColor: e.target.value })}
                      disabled={((selectedObject as any).styleOptions?.backgroundColor) === 'transparent'}
                      className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0 shrink-0 disabled:opacity-40"
                    />
                    <button
                      onClick={() => {
                        const isTransparent = ((selectedObject as any).styleOptions?.backgroundColor) === 'transparent';
                        updateRichText((selectedObject as any).htmlContent, { 
                          backgroundColor: isTransparent ? '#ffffff' : 'transparent' 
                        });
                      }}
                      className={`px-1.5 py-1 text-[8px] font-bold border rounded transition-all shrink-0 ${
                        ((selectedObject as any).styleOptions?.backgroundColor) === 'transparent'
                          ? 'bg-amber-500/10 border-[#d4af37] text-stone-900'
                          : 'bg-white border-stone-200 text-stone-500'
                      }`}
                    >
                      {((selectedObject as any).styleOptions?.backgroundColor) === 'transparent' ? 'Solid' : 'Clear'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Padding</label>
                  <select
                    value={((selectedObject as any).styleOptions?.padding) || '16px'}
                    onChange={(e) => updateRichText((selectedObject as any).htmlContent, { padding: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-md p-1 text-xs font-semibold bg-white text-stone-700"
                  >
                    <option value="0px">None</option>
                    <option value="8px">Small (8px)</option>
                    <option value="16px">Medium (16px)</option>
                    <option value="24px">Large (24px)</option>
                    <option value="32px">X-Large (32px)</option>
                  </select>
                </div>
              </div>

              {/* Borders Radius & Thickness */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Border Width</label>
                  <select
                    value={((selectedObject as any).styleOptions?.borderWidth) || '0px'}
                    onChange={(e) => updateRichText((selectedObject as any).htmlContent, { borderWidth: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-md p-1 text-xs font-semibold bg-white text-stone-700"
                  >
                    <option value="0px">None</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="4px">4px</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Border Radius</label>
                  <select
                    value={((selectedObject as any).styleOptions?.borderRadius) || '8px'}
                    onChange={(e) => updateRichText((selectedObject as any).htmlContent, { borderRadius: e.target.value })}
                    className="w-full mt-1 border border-stone-200 rounded-md p-1 text-xs font-semibold bg-white text-stone-700"
                  >
                    <option value="0px">Square</option>
                    <option value="4px">Small (4px)</option>
                    <option value="8px">Medium (8px)</option>
                    <option value="16px">Large (16px)</option>
                    <option value="24px">Round (24px)</option>
                  </select>
                </div>
              </div>

              {/* Border Color */}
              {((selectedObject as any).styleOptions?.borderWidth) !== '0px' && (
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Border Color</label>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color"
                      value={((selectedObject as any).styleOptions?.borderColor) || '#d4af37'}
                      onChange={(e) => updateRichText((selectedObject as any).htmlContent, { borderColor: e.target.value })}
                      className="w-8 h-8 rounded border border-stone-200 cursor-pointer p-0 shrink-0"
                    />
                    <span className="text-[9px] font-mono uppercase text-stone-600">
                      {((selectedObject as any).styleOptions?.borderColor) || '#d4af37'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEXT PROPERTIES VIEW */}
        {isText && (
          <div className="space-y-4">
            {/* 1. Quote Content Block (Double click also works) */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Text Content</label>
              <textarea 
                value={(selectedObject as fabric.Textbox).text || ''}
                onChange={(e) => updateValue('text', e.target.value)}
                rows={3}
                className="w-full mt-1 border border-stone-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-stone-50"
              />
            </div>

            {/* 2. Font Selection Block */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Font Family</label>
                <select
                  value={(selectedObject as fabric.Textbox).fontFamily}
                  onChange={(e) => updateValue('fontFamily', e.target.value)}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold focus:outline-none bg-white"
                >
                  <option value="Inter, sans-serif">Sans-Serif (Inter)</option>
                  <option value="Playfair Display, Georgia, serif">Serif (Playfair)</option>
                  <option value="Georgia, serif">Serif (Classic)</option>
                  <option value="Courier New, Courier, monospace">Monospace (Courier)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Font Weight</label>
                <select
                  value={(selectedObject as fabric.Textbox).fontWeight}
                  onChange={(e) => updateValue('fontWeight', e.target.value)}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold focus:outline-none bg-white"
                >
                  <option value="300">Light</option>
                  <option value="normal">Regular</option>
                  <option value="500">Medium</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>

            {/* 3. Typography Coordinates Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Size (px)</label>
                <input 
                  type="number"
                  value={Math.round((selectedObject as fabric.Textbox).fontSize || 12)}
                  onChange={(e) => updateValue('fontSize', parseInt(e.target.value) || 12)}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Text Color</label>
                <div className="flex items-center gap-1.5 mt-1">
                  <input 
                    type="color"
                    value={((selectedObject as fabric.Textbox).fill as string) || '#000000'}
                    onChange={(e) => updateValue('fill', e.target.value)}
                    className="w-8 h-8 rounded border border-stone-200 cursor-pointer p-0"
                  />
                  <span className="text-[10px] font-mono uppercase text-stone-600">
                    {((selectedObject as fabric.Textbox).fill as string) || '#000000'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Formatting Alignment Options */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Text Alignment</label>
              <div className="flex items-center gap-1 mt-1 border border-stone-200 rounded-lg p-1 bg-stone-50">
                {(['left', 'center', 'right', 'justify'] as const).map((align) => {
                  const isSelected = (selectedObject as fabric.Textbox).textAlign === align;
                  return (
                    <button
                      key={align}
                      onClick={() => updateValue('textAlign', align)}
                      className={`flex-1 py-1 px-2 rounded flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-white shadow-sm text-stone-900 border border-stone-100' 
                          : 'text-stone-400 hover:text-stone-700'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Tracking / Line Heights */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Line Height</label>
                <input 
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="3"
                  value={(selectedObject as fabric.Textbox).lineHeight || 1.2}
                  onChange={(e) => updateValue('lineHeight', parseFloat(e.target.value) || 1.2)}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Char Spacing</label>
                <input 
                  type="number"
                  step="10"
                  value={(selectedObject as fabric.Textbox).charSpacing || 0}
                  onChange={(e) => updateValue('charSpacing', parseInt(e.target.value) || 0)}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Background highlight block color */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Highlight Box Fill</label>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="color"
                  value={(selectedObject as fabric.Textbox).textBackgroundColor || '#ffffff'}
                  onChange={(e) => updateValue('textBackgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-stone-200 cursor-pointer p-0"
                />
                <button 
                  onClick={() => updateValue('textBackgroundColor', '')}
                  className="text-[10px] text-stone-500 hover:text-stone-900 font-bold border border-stone-200 hover:border-stone-400 rounded px-2 py-1.5 bg-stone-50"
                >
                  Clear Box
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMAGE PROPERTIES VIEW */}
        {isImage && (
          <div className="space-y-4">
            {/* Opacity slider */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Opacity ({Math.round(opacity * 100)}%)</label>
              <input 
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(e) => updateValue('opacity', parseFloat(e.target.value))}
                className="w-full accent-[#d4af37]"
              />
            </div>

            {/* Quick URL Swap */}
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Change Image URL Source</label>
              <input 
                type="text"
                placeholder="Paste public image URL..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const url = e.currentTarget.value.trim();
                    if (url && canvas) {
                      fabric.Image.fromURL(url, {}, {}).then((newImg) => {
                        // replace underlying image content seamlessly
                        (selectedObject as fabric.Image).setSrc(url).then(() => {
                          canvas.renderAll();
                          triggerCanvasRefresh();
                          saveActiveProjectToStorage(canvas.toJSON().objects || []);
                        });
                      });
                    }
                  }
                }}
                className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold placeholder:text-stone-400 focus:outline-none"
              />
              <p className="text-[9px] text-stone-400 mt-1">Press Enter to swap image seamlessly</p>
            </div>
          </div>
        )}

        {/* STANDARD SHAPE PROPERTIES VIEW */}
        {selectedObject.type === 'rect' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Fill Color</label>
                <input 
                  type="color"
                  value={selectedObject.fill as string || '#d4af37'}
                  onChange={(e) => updateValue('fill', e.target.value)}
                  className="w-full h-8 rounded border border-stone-200 cursor-pointer p-0"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Stroke Color</label>
                <input 
                  type="color"
                  value={selectedObject.stroke as string || '#000000'}
                  onChange={(e) => updateValue('stroke', e.target.value)}
                  className="w-full h-8 rounded border border-stone-200 cursor-pointer p-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Stroke Width (px)</label>
                <input 
                  type="number"
                  min="0"
                  max="20"
                  value={selectedObject.strokeWidth || 0}
                  onChange={(e) => updateValue('strokeWidth', parseInt(e.target.value) || 0)}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Corner Radius</label>
                <input 
                  type="number"
                  min="0"
                  value={(selectedObject as fabric.Rect).rx || 0}
                  onChange={(e) => {
                    const radius = parseInt(e.target.value) || 0;
                    updateValue('rx', radius);
                    updateValue('ry', radius);
                  }}
                  className="w-full mt-1 border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        <hr className="border-stone-100" />

        {/* GEOMETRIC TRANSFORMS ROW (Applicable to all elements) */}
        <div>
          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Geometric Transform</h4>
          <div className="grid grid-cols-2 gap-2 text-stone-600">
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400">Width (W)</label>
              <input 
                type="number"
                value={width}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  // adjust width using standard scale parameters safely to prevent aspect distortion
                  updateValue('scaleX', val / selectedObject.width!);
                }}
                className="w-full border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400">Height (H)</label>
              <input 
                type="number"
                value={height}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  updateValue('scaleY', val / selectedObject.height!);
                }}
                className="w-full border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400">Pos X (left)</label>
              <input 
                type="number"
                value={left}
                onChange={(e) => updateValue('left', parseInt(e.target.value) || 0)}
                className="w-full border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-stone-400">Pos Y (top)</label>
              <input 
                type="number"
                value={top}
                onChange={(e) => updateValue('top', parseInt(e.target.value) || 0)}
                className="w-full border border-stone-200 rounded-md p-1.5 text-xs font-semibold"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[9px] font-bold uppercase text-stone-400">Rotation (Angle °)</label>
              <input 
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => updateValue('angle', parseInt(e.target.value) || 0)}
                className="w-full accent-[#d4af37]"
              />
            </div>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* LAYER OPERATIONS ACTION BOTTOM BLOCK */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleDuplicate}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-200 hover:border-stone-400 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-100 hover:border-red-400 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
