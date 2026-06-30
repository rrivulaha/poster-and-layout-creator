/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Maximize2, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Type, 
  Square, 
  Circle, 
  Minus, 
  Sparkles, 
  Image as ImageIcon 
} from 'lucide-react';

interface CanvasWorkspaceProps {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({ canvasRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlCanvasRef = useRef<HTMLCanvasElement>(null);
  const snapGuidesRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  
  const { 
    activeProjectId, 
    projects, 
    zoomRatio, 
    setZoomRatio,
    setSelectedObjectId, 
    triggerCanvasRefresh,
    gridEnabled,
    snapEnabled,
    saveActiveProjectToStorage
  } = useEditorStore();

  const currentProject = projects.find(p => p.id === activeProjectId);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    designX: number;
    designY: number;
    hasTarget: boolean;
  }>({
    visible: false,
    x: 0,
    y: 0,
    designX: 0,
    designY: 0,
    hasTarget: false
  });

  const [uploadedLogos, setUploadedLogos] = useState<{name: string, data: string}[]>([]);

  // Update custom logos when opening context menu
  useEffect(() => {
    if (contextMenu.visible) {
      try {
        const saved = localStorage.getItem('avfi_uploaded_logos');
        setUploadedLogos(saved ? JSON.parse(saved) : []);
      } catch (e) {
        setUploadedLogos([]);
      }
    }
  }, [contextMenu.visible]);

  // Close context menu on outside click
  useEffect(() => {
    const handleCloseMenu = () => {
      setContextMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
    };
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click coordinates to design canvas space (Fabric v6 uses getScenePoint)
    const pointer = (canvas as any).getScenePoint ? (canvas as any).getScenePoint(e.nativeEvent) : (canvas as any).getPointer(e.nativeEvent);
    const designX = pointer.x;
    const designY = pointer.y;

    // Select the object right-clicked on
    const targetInfo = (canvas as any).findTarget(e.nativeEvent);
    let targetObj = null;
    if (targetInfo) {
      targetObj = targetInfo.get ? targetInfo : targetInfo.target;
    }

    let hasTarget = false;
    if (targetObj) {
      canvas.setActiveObject(targetObj);
      canvas.renderAll();
      setSelectedObjectId((targetObj as any).get('id') as string, (targetObj as any).get('type') || null);
      triggerCanvasRefresh();
      hasTarget = true;
    } else {
      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedObjectId(null, null);
      triggerCanvasRefresh();
    }

    setContextMenu({
      visible: true,
      x: clickX,
      y: clickY,
      designX,
      designY,
      hasTarget
    });
  };

  const handleDeleteAsset = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.remove(activeObj);
      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedObjectId(null, null);
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    }
  };

  const handleAddTextAsset = (type: 'heading' | 'subheading' | 'body') => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let text = '';
    let fontSize = 16;
    let fontWeight = 'normal';

    if (type === 'heading') {
      text = 'Heading Text';
      fontSize = 28;
      fontWeight = 'bold';
    } else if (type === 'subheading') {
      text = 'Subheading Text';
      fontSize = 18;
      fontWeight = 'bold';
    } else {
      text = 'Body paragraph text block.';
      fontSize = 14;
    }

    const textObj = new fabric.Textbox(text, {
      left: contextMenu.designX,
      top: contextMenu.designY,
      width: 250,
      fontSize,
      fontWeight,
      fontFamily: 'Inter, sans-serif',
      fill: '#111111',
      textAlign: 'left'
    });

    textObj.set('id', `text_${Date.now()}`);
    textObj.set('name', `${type.charAt(0).toUpperCase() + type.slice(1)} Text`);

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    triggerCanvasRefresh();
    saveActiveProjectToStorage(canvas.toJSON().objects || []);
  };

  const handleAddShapeAsset = (shapeType: 'rect' | 'circle' | 'line') => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let shape: fabric.Object;

    if (shapeType === 'rect') {
      shape = new fabric.Rect({
        left: contextMenu.designX,
        top: contextMenu.designY,
        width: 120,
        height: 120,
        fill: '#d4af37',
        strokeWidth: 0
      });
      shape.set('name', 'Rectangle Shape');
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({
        left: contextMenu.designX,
        top: contextMenu.designY,
        radius: 60,
        fill: '#111111',
        strokeWidth: 0
      });
      shape.set('name', 'Circle Shape');
    } else {
      shape = new fabric.Rect({
        left: contextMenu.designX,
        top: contextMenu.designY,
        width: 200,
        height: 4,
        fill: '#111111',
        strokeWidth: 0
      });
      shape.set('name', 'Horizontal Divider Line');
    }

    shape.set('id', `${shapeType}_${Date.now()}`);
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    triggerCanvasRefresh();
    saveActiveProjectToStorage(canvas.toJSON().objects || []);
  };

  const handleAddLogoAsset = (src: string, name: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    fabric.Image.fromURL(src, {}, {}).then((imgObj) => {
      imgObj.set({
        left: contextMenu.designX,
        top: contextMenu.designY,
        selectable: true,
        id: `img_logo_${Date.now()}`,
        name: name
      });

      // Maintain uniform aspect scaling
      (imgObj as any).lockUniScaling = true;
      imgObj.setControlsVisibility({
        ml: false,
        mr: false,
        mt: false,
        mb: false
      });

      // Fit inside a reasonable bounding box
      const maxW = 160;
      const maxH = 60;
      const scaleX = maxW / (imgObj.width || 1);
      const scaleY = maxH / (imgObj.height || 1);
      const minScale = Math.min(scaleX, scaleY);
      imgObj.scale(minScale);

      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    });
  };

  // Helper to compute optimal zoom to fit canvas in full view
  const autoFit = () => {
    if (!containerRef.current || !currentProject) return;
    const containerWidth = containerRef.current.clientWidth - 80;
    const containerHeight = containerRef.current.clientHeight - 80;
    const projectWidth = currentProject.width || 800;
    const projectHeight = currentProject.height || 600;
    
    const fitZoomX = containerWidth / projectWidth;
    const fitZoomY = containerHeight / projectHeight;
    // Fit chosen aspect ratio fully in available workspace area
    const optimalZoom = Math.min(fitZoomX, fitZoomY);
    setZoomRatio(optimalZoom);
  };

  // Register custom properties globally on Fabric classes for serialization in Fabric v6/v7
  useEffect(() => {
    const customProps = ['id', 'name', 'isRichText', 'htmlContent', 'styleOptions', 'lockUniScaling'];
    if ((fabric as any).FabricObject) {
      (fabric as any).FabricObject.customProperties = customProps;
    }
    if (fabric.Object) {
      (fabric.Object as any).customProperties = customProps;
    }
    // Lock aspect ratio scaling by default on images globally
    if (fabric.Image) {
      (fabric.Image.prototype as any).lockUniScaling = true;
    }
  }, []);

  // 1. Initialize the Fabric canvas once on mount
  useEffect(() => {
    if (!htmlCanvasRef.current || !containerRef.current) return;

    // Create the Fabric canvas
    const canvas = new fabric.Canvas(htmlCanvasRef.current, {
      preserveObjectStacking: true,
      selectionColor: 'rgba(212, 175, 55, 0.15)', // elegant golden hue
      selectionBorderColor: '#d4af37',
      selectionLineWidth: 1
    });

    canvasRef.current = canvas;

    // Set custom control properties globally for a cleaner, modern look
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = '#d4af37'; // Golden handles
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.cornerSize = 10;
    fabric.Object.prototype.borderColor = '#d4af37';
    fabric.Object.prototype.borderScaleFactor = 1.5;

    // Event listeners for state updates
    const onSelection = () => {
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        if (!activeObj.get('id')) {
          activeObj.set('id', `obj_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`);
        }
        setSelectedObjectId(activeObj.get('id') as string, activeObj.get('type') || null);
      } else {
        setSelectedObjectId(null, null);
      }
      triggerCanvasRefresh();
    };

    const onModified = () => {
      onSelection();
      // Auto save active project
      const serialized = canvas.toJSON();
      if (serialized && serialized.objects) {
        saveActiveProjectToStorage(serialized.objects);
      }
    };

    const onObjectAdded = (e: any) => {
      const obj = e.target || e;
      if (obj && (obj.type === 'image' || obj instanceof fabric.Image)) {
        (obj as any).set({
          lockUniScaling: true
        });
        obj.setControlsVisibility({
          ml: false,
          mr: false,
          mt: false,
          mb: false
        });
      }
      onModified();
    };

    // Snapping / Alignment Assist Logic
    const onMoving = () => {
      const activeObj = canvas.getActiveObject();
      if (!activeObj || !useEditorStore.getState().snapEnabled) {
        snapGuidesRef.current = { x: null, y: null };
        return;
      }

      const snapTolerance = 15;
      const center = activeObj.getCenterPoint();
      const halfWidth = (activeObj.width! * activeObj.scaleX!) / 2;
      const halfHeight = (activeObj.height! * activeObj.scaleY!) / 2;

      const leftEdge = center.x - halfWidth;
      const rightEdge = center.x + halfWidth;
      const topEdge = center.y - halfHeight;
      const bottomEdge = center.y + halfHeight;

      const state = useEditorStore.getState();
      const project = state.projects.find(p => p.id === state.activeProjectId);
      if (!project) return;
      
      const canvasWidth = project.width;
      const canvasHeight = project.height;

      let guideX: number | null = null;
      let guideY: number | null = null;

      let newCenterX = center.x;
      let newCenterY = center.y;

      // Horizontal Snapping (X-axis)
      if (Math.abs(center.x - canvasWidth / 2) < snapTolerance) {
        newCenterX = canvasWidth / 2;
        guideX = canvasWidth / 2;
      }
      else if (Math.abs(leftEdge) < snapTolerance) {
        newCenterX = halfWidth;
        guideX = 0;
      }
      else if (Math.abs(rightEdge - canvasWidth) < snapTolerance) {
        newCenterX = canvasWidth - halfWidth;
        guideX = canvasWidth;
      }

      // Vertical Snapping (Y-axis)
      if (Math.abs(center.y - canvasHeight / 2) < snapTolerance) {
        newCenterY = canvasHeight / 2;
        guideY = canvasHeight / 2;
      }
      else if (Math.abs(topEdge) < snapTolerance) {
        newCenterY = halfHeight;
        guideY = 0;
      }
      else if (Math.abs(bottomEdge - canvasHeight) < snapTolerance) {
        newCenterY = canvasHeight - halfHeight;
        guideY = canvasHeight;
      }

      const originX = activeObj.originX || 'left';
      const originY = activeObj.originY || 'top';

      let finalLeft = activeObj.left;
      let finalTop = activeObj.top;

      if (newCenterX !== center.x) {
        if (originX === 'center') {
          finalLeft = newCenterX;
        } else if (originX === 'left') {
          finalLeft = newCenterX - halfWidth;
        } else if (originX === 'right') {
          finalLeft = newCenterX + halfWidth;
        }
      }

      if (newCenterY !== center.y) {
        if (originY === 'center') {
          finalTop = newCenterY;
        } else if (originY === 'top') {
          finalTop = newCenterY - halfHeight;
        } else if (originY === 'bottom') {
          finalTop = newCenterY + halfHeight;
        }
      }

      activeObj.set({ left: finalLeft, top: finalTop });
      snapGuidesRef.current = { x: guideX, y: guideY };

      activeObj.setCoords();
      canvas.renderAll();
    };

    const clearSnapGuides = () => {
      snapGuidesRef.current = { x: null, y: null };
      canvas.renderAll();
    };

    const onAfterRender = (opt: any) => {
      const ctx = opt.ctx;
      ctx.save();

      const state = useEditorStore.getState();
      const project = state.projects.find(p => p.id === state.activeProjectId);
      if (!project) {
        ctx.restore();
        return;
      }

      const designWidth = project.width;
      const designHeight = project.height;
      const zoom = canvas.getZoom();

      // Draw Grid Lines if enabled
      if (state.gridEnabled) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 0.5 / zoom;
        const gridSize = 50;
        
        for (let x = gridSize; x < designWidth; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, designHeight);
          ctx.stroke();
        }
        for (let y = gridSize; y < designHeight; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(designWidth, y);
          ctx.stroke();
        }
      }

      // Draw Magnetic Snap Guide Lines if active
      const snapGuides = snapGuidesRef.current;
      if (state.snapEnabled) {
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([4 / zoom, 4 / zoom]);

        if (snapGuides.x !== null) {
          ctx.beginPath();
          ctx.moveTo(snapGuides.x, 0);
          ctx.lineTo(snapGuides.x, designHeight);
          ctx.stroke();
        }

        if (snapGuides.y !== null) {
          ctx.beginPath();
          ctx.moveTo(0, snapGuides.y);
          ctx.lineTo(designWidth, snapGuides.y);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    canvas.on('selection:created', onSelection);
    canvas.on('selection:updated', onSelection);
    canvas.on('selection:cleared', onSelection);
    canvas.on('selection:cleared', clearSnapGuides);
    
    canvas.on('object:added', onObjectAdded);
    canvas.on('object:removed', onModified);
    canvas.on('object:modified', onModified);
    canvas.on('object:modified', clearSnapGuides);
    canvas.on('object:moving', onMoving);
    canvas.on('after:render', onAfterRender);

    canvas.renderAll();

    return () => {
      canvas.off('selection:created', onSelection);
      canvas.off('selection:updated', onSelection);
      canvas.off('selection:cleared', onSelection);
      canvas.off('selection:cleared', clearSnapGuides);
      canvas.off('object:added', onObjectAdded);
      canvas.off('object:removed', onModified);
      canvas.off('object:modified', onModified);
      canvas.off('object:modified', clearSnapGuides);
      canvas.off('object:moving', onMoving);
      canvas.off('after:render', onAfterRender);
      
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []); // Run ONCE on mount

  // 2. Load project page objects asynchronously when project/page changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentProject) return;

    const projectWidth = currentProject.width;
    const projectHeight = currentProject.height;

    // Keep size in sync
    canvas.setDimensions({
      width: projectWidth * zoomRatio,
      height: projectHeight * zoomRatio
    });
    canvas.setZoom(zoomRatio);

    const currentPage = currentProject.pages[currentProject.activePageIndex];
    canvas.backgroundColor = currentPage?.backgroundColor || '#ffffff';

    canvas.clear();

    if (currentPage && currentPage.objects && currentPage.objects.length > 0) {
      const jsonStr = JSON.stringify({ objects: currentPage.objects });
      canvas.loadFromJSON(jsonStr).then(() => {
        canvas.renderAll();
        triggerCanvasRefresh();
      });
    } else {
      canvas.renderAll();
      triggerCanvasRefresh();
    }
  }, [activeProjectId, currentProject?.activePageIndex]);

  // Re-render canvas when grid or snapping toggles
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.renderAll();
    }
  }, [gridEnabled, snapEnabled]);

  // Handle workspace container resizing dynamically
  useEffect(() => {
    if (!containerRef.current || !currentProject) return;

    const resizeObserver = new ResizeObserver(() => {
      autoFit();
    });

    resizeObserver.observe(containerRef.current);

    // Initial fit
    autoFit();

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentProject?.width, currentProject?.height, activeProjectId]);

  // Adjust zoom on canvas wrapper
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.setZoom(zoomRatio);
    // Maintain outer workspace size relative to zoom ratio
    const projectWidth = currentProject?.width || 800;
    const projectHeight = currentProject?.height || 600;
    canvas.setDimensions({
      width: projectWidth * zoomRatio,
      height: projectHeight * zoomRatio
    });
    canvas.renderAll();
  }, [zoomRatio, currentProject?.width, currentProject?.height]);

  return (
    <div 
      ref={containerRef}
      onContextMenu={handleContextMenu}
      className="flex-1 bg-stone-100 flex items-center justify-center overflow-auto p-12 relative cursor-crosshair select-none"
      id="canvas-workspace"
    >
      {/* Grid Overlay inside the workspace frame */}
      <div 
        className="shadow-2xl relative bg-white border border-stone-200 transition-all duration-150"
        style={{
          width: `${(currentProject?.width || 800) * zoomRatio}px`,
          height: `${(currentProject?.height || 600) * zoomRatio}px`,
        }}
      >
        <canvas ref={htmlCanvasRef} className="absolute inset-0" />
      </div>

      {/* Rulers / Canvas Dimensions Metadata display with FIT button */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur border border-stone-200 p-1.5 rounded-lg shadow-sm select-none z-10">
        <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider px-1">
          Size: {currentProject?.width} × {currentProject?.height} {currentProject?.unit || 'px'} @ {Math.round(zoomRatio * 100)}%
        </span>
        <button
          onClick={autoFit}
          className="text-[10px] font-bold bg-stone-50 hover:bg-[#d4af37]/10 hover:text-[#d4af37] border border-stone-200 hover:border-[#d4af37] text-stone-600 px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Zoom to Fit Aspect Ratio"
        >
          <Maximize2 className="w-2.5 h-2.5" />
          Fit Screen
        </button>
      </div>

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div 
          className="absolute bg-white border border-stone-200 rounded-xl shadow-xl py-1 z-50 w-56 flex flex-col font-sans select-none animate-fade-in"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.hasTarget && (
            <button
              onClick={() => {
                handleDeleteAsset();
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-stone-100 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected Asset
            </button>
          )}

          <div className="px-3.5 py-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
            Add Text
          </div>
          <button
            onClick={() => {
              handleAddTextAsset('heading');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-stone-400" />
            Heading Text
          </button>
          <button
            onClick={() => {
              handleAddTextAsset('subheading');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-stone-400" />
            Subheading Text
          </button>
          <button
            onClick={() => {
              handleAddTextAsset('body');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 border-b border-stone-100 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-stone-400" />
            Body Paragraph
          </button>

          <div className="px-3.5 py-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
            Add Shape
          </div>
          <button
            onClick={() => {
              handleAddShapeAsset('rect');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-stone-400" />
            Rectangle Block
          </button>
          <button
            onClick={() => {
              handleAddShapeAsset('circle');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
          >
            <Circle className="w-3.5 h-3.5 text-stone-400" />
            Circle Block
          </button>
          <button
            onClick={() => {
              handleAddShapeAsset('line');
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 border-b border-stone-100 cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5 text-stone-400" />
            Horizontal Divider
          </button>

          <div className="px-3.5 py-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
            Add Prebuilt Logo
          </div>
          <button
            onClick={() => {
              handleAddLogoAsset(
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 45'><circle cx='20' cy='22' r='15' fill='%23d4af37'/><circle cx='20' cy='22' r='5' fill='%23f4f3ef'/><text x='45' y='20' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23111111'>Auroville</text><text x='45' y='32' font-family='sans-serif' font-size='9' letter-spacing='1' fill='%23111111'>FILM INSTITUTE</text></svg>",
                "Auroville Film Institute Logo"
              );
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            Auroville Logo
          </button>
          <button
            onClick={() => {
              handleAddLogoAsset(
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 45'><path d='M10 22 L20 12 L30 22 L20 32 Z' fill='none' stroke='%238b263e' stroke-width='3'/><text x='40' y='20' font-family='sans-serif' font-size='9' font-weight='bold' fill='%23111111'>HIMALAYAN INSTITUTE</text><text x='40' y='32' font-family='sans-serif' font-size='8' fill='%23111111'>OF ALTERNATIVES, LADAKH</text></svg>",
                "Himalayan Institute Logo"
              );
              setContextMenu(prev => ({ ...prev, visible: false }));
            }}
            className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            Himalayan Logo
          </button>

          {uploadedLogos.length > 0 && (
            <>
              <div className="px-3.5 py-1.5 text-[9px] font-bold text-stone-400 uppercase tracking-wider border-t border-stone-100">
                Add Uploaded Logo
              </div>
              <div className="max-h-32 overflow-y-auto">
                {uploadedLogos.map((logo, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleAddLogoAsset(logo.data, logo.name);
                      setContextMenu(prev => ({ ...prev, visible: false }));
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center gap-2 truncate cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate flex-1">{logo.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
