/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../../store/useEditorStore';
import { Image as ImageIcon, Layers, Upload, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, Trash2, Copy, Quote, Sparkles, Type, Table, Play, Download } from 'lucide-react';
import { svgToDataUrl } from '../../utils/assets';

const DEFAULT_RICH_TEXT_STYLES = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '18px',
  color: '#111111',
  lineHeight: '1.6',
  backgroundColor: '#fdfbf7', // warm beige background
  padding: '20px',
  borderRadius: '8px',
  borderWidth: '1px',
  borderColor: '#d4af37',
  textAlign: 'left'
};

const DEFAULT_TEMPLATES = [
  {
    id: 'default_tpl_quote',
    name: 'Elegant Quote (Gold Frame)',
    width: 1600,
    height: 2400,
    backgroundColor: '#f9f6f0',
    objects: [
      {
        type: 'rect',
        id: 'background_border',
        name: 'Background Border',
        left: 800,
        top: 1200,
        originX: 'center',
        originY: 'center',
        width: 1440,
        height: 2240,
        fill: 'transparent',
        stroke: '#d4af37',
        strokeWidth: 4,
        selectable: false
      },
      {
        type: 'image',
        id: 'quote_icon',
        name: 'Quote Icon Placeholder',
        left: 800,
        top: 450,
        originX: 'center',
        originY: 'center',
        width: 120,
        height: 120,
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d4af37'><path d='M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z'/></svg>",
        selectable: true
      },
      {
        type: 'textbox',
        id: 'quote_body',
        name: 'Quote Body',
        left: 800,
        top: 1050,
        originX: 'center',
        originY: 'center',
        width: 1200,
        text: '"The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle. As with all matters of the heart, you\'ll know when you find it."',
        fontSize: 56,
        fontFamily: 'Georgia, serif',
        fill: '#111111',
        textAlign: 'center',
        lineHeight: 1.6,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'quote_author',
        name: 'Author Name',
        left: 800,
        top: 1550,
        originX: 'center',
        originY: 'center',
        width: 1000,
        text: 'Steve Jobs',
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'center',
        charSpacing: 100,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'quote_author_title',
        name: 'Author Title/Context',
        left: 800,
        top: 1630,
        originX: 'center',
        originY: 'center',
        width: 1000,
        text: 'Co-founder of Apple Inc.',
        fontSize: 32,
        fontFamily: 'Inter, sans-serif',
        fill: '#718096',
        textAlign: 'center',
        selectable: true
      },
      {
        type: 'image',
        id: 'author_avatar',
        name: 'Author Avatar/Logo',
        left: 800,
        top: 1820,
        originX: 'center',
        originY: 'center',
        width: 180,
        height: 180,
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23e2e8f0' stroke='%23d4af37' stroke-width='2'/><path d='M50 30A15 15 0 1 0 50 60A15 15 0 1 0 50 30Z' fill='%23a0aec0'/><path d='M15 85C15 70 30 65 50 65C70 65 85 70 85 85' fill='%23a0aec0'/></svg>",
        selectable: true
      }
    ]
  },
  {
    id: 'default_tpl_id_card',
    name: 'Professional ID Card (Navy/Gold)',
    width: 800,
    height: 1200,
    backgroundColor: '#0f172a',
    objects: [
      {
        type: 'rect',
        id: 'id_border',
        name: 'Gold Border Deco',
        left: 400,
        top: 600,
        originX: 'center',
        originY: 'center',
        width: 730,
        height: 1130,
        fill: 'transparent',
        stroke: '#d4af37',
        strokeWidth: 4,
        selectable: false
      },
      {
        type: 'textbox',
        id: 'id_header_org',
        name: 'Organization Name',
        left: 400,
        top: 150,
        originX: 'center',
        originY: 'center',
        width: 600,
        text: 'AVFI DESIGN ACADEMY',
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#ffffff',
        textAlign: 'center',
        charSpacing: 200,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'id_header_sub',
        name: 'Access Tier',
        left: 400,
        top: 200,
        originX: 'center',
        originY: 'center',
        width: 600,
        text: 'ALL-ACCESS CREDENTIAL',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#94a3b8',
        textAlign: 'center',
        charSpacing: 150,
        selectable: true
      },
      {
        type: 'image',
        id: 'id_member_avatar',
        name: 'Member Portrait Frame',
        left: 400,
        top: 450,
        originX: 'center',
        originY: 'center',
        width: 300,
        height: 300,
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%231e293b' stroke='%23d4af37' stroke-width='3'/><path d='M50 30A15 15 0 1 0 50 60A15 15 0 1 0 50 30Z' fill='%2364748b'/><path d='M15 85C15 70 30 65 50 65C70 65 85 70 85 85' fill='%2364748b'/></svg>",
        selectable: true
      },
      {
        type: 'textbox',
        id: 'id_member_name',
        name: 'Member Full Name',
        left: 400,
        top: 680,
        originX: 'center',
        originY: 'center',
        width: 600,
        text: 'Alex Mercer',
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#ffffff',
        textAlign: 'center',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'id_member_role',
        name: 'Member Role',
        left: 400,
        top: 740,
        originX: 'center',
        originY: 'center',
        width: 600,
        text: 'LEAD CREATIVE DIRECTOR',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#d4af37',
        textAlign: 'center',
        charSpacing: 100,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'id_badge_privileges',
        name: 'Access Privileges',
        left: 400,
        top: 890,
        originX: 'center',
        originY: 'center',
        width: 580,
        text: 'Level 5 Clearance • Secure Labs Access • Exp: 12/2026',
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fill: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.4,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'id_serial',
        name: 'ID Serial Barcode Code',
        left: 400,
        top: 1040,
        originX: 'center',
        originY: 'center',
        width: 600,
        text: 'SERIAL NO: 9982-A72B-FD90',
        fontSize: 18,
        fontFamily: 'Courier New, monospace',
        fill: '#64748b',
        textAlign: 'center',
        charSpacing: 120,
        selectable: true
      }
    ]
  },
  {
    id: 'default_tpl_invitation',
    name: 'Modern Gala Invitation',
    width: 1000,
    height: 1500,
    backgroundColor: '#ffffff',
    objects: [
      {
        type: 'rect',
        id: 'inv_bg_border_outer',
        name: 'Outer Fine Border',
        left: 500,
        top: 750,
        originX: 'center',
        originY: 'center',
        width: 900,
        height: 1400,
        fill: 'transparent',
        stroke: '#d4af37',
        strokeWidth: 2,
        selectable: false
      },
      {
        type: 'rect',
        id: 'inv_bg_border_inner',
        name: 'Inner Accent Border',
        left: 500,
        top: 750,
        originX: 'center',
        originY: 'center',
        width: 860,
        height: 1360,
        fill: 'transparent',
        stroke: '#f3e8ff',
        strokeWidth: 1,
        selectable: false
      },
      {
        type: 'textbox',
        id: 'inv_header_decor',
        name: 'Invitation Greeting',
        left: 500,
        top: 250,
        originX: 'center',
        originY: 'center',
        width: 800,
        text: 'YOU ARE CORDIALLY INVITED TO',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#d4af37',
        textAlign: 'center',
        charSpacing: 250,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'inv_title',
        name: 'Event Title Main',
        left: 500,
        top: 400,
        originX: 'center',
        originY: 'center',
        width: 800,
        text: 'The Annual Gala',
        fontSize: 72,
        fontWeight: 'bold',
        fontFamily: 'Georgia, serif',
        fill: '#111111',
        textAlign: 'center',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'inv_details',
        name: 'Event Schedule',
        left: 500,
        top: 750,
        originX: 'center',
        originY: 'center',
        width: 760,
        text: 'Join us for an exquisite evening of cinema, networking, and creativity.\n\nSaturday, October 24th, 2026\nSeven o\'clock in the evening\n\nMetropolitan Grand Pavilion',
        fontSize: 22,
        fontFamily: 'Inter, sans-serif',
        fill: '#333333',
        textAlign: 'center',
        lineHeight: 1.6,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'inv_rsvp_info',
        name: 'RSVP Info TextBox',
        left: 500,
        top: 1100,
        originX: 'center',
        originY: 'center',
        width: 800,
        text: 'RSVP BY OCTOBER 10TH',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#4b5563',
        textAlign: 'center',
        charSpacing: 180,
        selectable: true
      },
      {
        type: 'textbox',
        id: 'inv_footer_url',
        name: 'Footer RSVP URL',
        left: 500,
        top: 1160,
        originX: 'center',
        originY: 'center',
        width: 800,
        text: 'www.avfidesignacademy.com/gala',
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fill: '#9ca3af',
        textAlign: 'center',
        selectable: true
      }
    ]
  },
  {
    id: 'default_tpl_student_id',
    name: 'Student ID Card (AVFI & HIAL)',
    width: 600,
    height: 400,
    backgroundColor: '#f4f3ef',
    objects: [
      {
        type: 'rect',
        id: 'card_border',
        name: 'Card Border Frame',
        left: 300,
        top: 200,
        originX: 'center',
        originY: 'center',
        width: 570,
        height: 370,
        fill: 'transparent',
        stroke: '#d4af37',
        strokeWidth: 2,
        selectable: false
      },
      {
        type: 'image',
        id: 'logo_auroville',
        name: 'Auroville Film Institute Logo',
        left: 380,
        top: 60,
        originX: 'center',
        originY: 'center',
        width: 140,
        height: 45,
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 45'><circle cx='20' cy='22' r='15' fill='%23d4af37'/><circle cx='20' cy='22' r='5' fill='%23f4f3ef'/><text x='45' y='20' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23111111'>Auroville</text><text x='45' y='32' font-family='sans-serif' font-size='9' letter-spacing='1' fill='%23111111'>FILM INSTITUTE</text></svg>",
        selectable: true
      },
      {
        type: 'image',
        id: 'logo_himalayan',
        name: 'Himalayan Institute Logo',
        left: 500,
        top: 60,
        originX: 'center',
        originY: 'center',
        width: 140,
        height: 45,
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 45'><path d='M10 22 L20 12 L30 22 L20 32 Z' fill='none' stroke='%238b263e' stroke-width='3'/><text x='40' y='20' font-family='sans-serif' font-size='9' font-weight='bold' fill='%23111111'>HIMALAYAN INSTITUTE</text><text x='40' y='32' font-family='sans-serif' font-size='8' fill='%23111111'>OF ALTERNATIVES, LADAKH</text></svg>",
        selectable: true
      },
      {
        type: 'image',
        id: 'student_avatar',
        name: 'Student Profile Picture Zone',
        left: 130,
        top: 180,
        originX: 'center',
        originY: 'center',
        width: 160,
        height: 160,
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><circle cx='80' cy='80' r='78' fill='%23e2e8f0' stroke='%23ffffff' stroke-width='4'/><path d='M80 45A22 22 0 1 0 80 89A22 22 0 1 0 80 45Z' fill='%23a0aec0'/><path d='M25 135C25 110 50 100 80 100C110 100 135 110 135 135' fill='%23a0aec0'/></svg>",
        selectable: true
      },
      {
        type: 'textbox',
        id: 'student_name',
        name: 'Student Name',
        left: 310,
        top: 130,
        originX: 'left',
        originY: 'center',
        width: 250,
        text: 'Charita',
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'left',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'student_role',
        name: 'Role Designation',
        left: 310,
        top: 160,
        originX: 'left',
        originY: 'center',
        width: 250,
        text: 'Student',
        fontSize: 20,
        fontFamily: 'Inter, sans-serif',
        fill: '#4a5568',
        textAlign: 'left',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'course_title',
        name: 'Course Title',
        left: 310,
        top: 190,
        originX: 'left',
        originY: 'center',
        width: 250,
        text: 'Open Space Documentary Arts',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'left',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'course_duration',
        name: 'Course Duration',
        left: 550,
        top: 215,
        originX: 'right',
        originY: 'center',
        width: 200,
        text: '1 YEAR PG DIPLOMA',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'right',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'validity_date',
        name: 'Validity Date',
        left: 310,
        top: 245,
        originX: 'left',
        originY: 'center',
        width: 250,
        text: 'Valid till: 31st July, 2026',
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'left',
        selectable: true
      },
      {
        type: 'textbox',
        id: 'issued_by_label',
        name: 'Issued By Label',
        left: 480,
        top: 290,
        originX: 'center',
        originY: 'center',
        width: 150,
        text: 'Issued by:',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fill: '#4a5568',
        textAlign: 'center',
        selectable: false
      },
      {
        type: 'textbox',
        id: 'student_signature_label',
        name: 'Student Signature Label',
        left: 130,
        top: 340,
        originX: 'center',
        originY: 'center',
        width: 160,
        text: 'Student signature',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'center',
        selectable: false
      },
      {
        type: 'textbox',
        id: 'director_signature_label',
        name: 'Programme Director Label',
        left: 480,
        top: 340,
        originX: 'center',
        originY: 'center',
        width: 220,
        text: 'Programme Director, AVFI',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fill: '#111111',
        textAlign: 'center',
        selectable: false
      }
    ]
  }
];

interface SidebarLeftProps {
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ canvasRef }) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'layers' | 'templates'>('assets');
  
  // Custom logo and template storage states
  const [uploadedLogos, setUploadedLogos] = useState<{name: string, data: string}[]>(() => {
    try {
      const saved = localStorage.getItem('avfi_uploaded_logos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [customTemplates, setCustomTemplates] = useState<{id: string, name: string, date: number, objects: any[]}[]>(() => {
    try {
      const saved = localStorage.getItem('avfi_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newTemplateName, setNewTemplateName] = useState('');
  const [canvasFields, setCanvasFields] = useState<any[]>([]);

  // CSV Spreadsheet Batch Processing states
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number, active: boolean}>({current: 0, total: 0, active: false});
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [rowStatuses, setRowStatuses] = useState<Record<number, 'pending' | 'exported' | 'skipped'>>({});
  const [batchExportMultiplier, setBatchExportMultiplier] = useState<number>(2.0);

  // Dynamic CSV template builder based on current canvas text/image fields
  const handleDownloadCsvTemplate = () => {
    if (canvasFields.length === 0) {
      alert("Please add some text/image fields to your canvas to generate a customized template spreadsheet!");
      return;
    }
    
    // Sanitize headers for CSV formatting
    const headers = canvasFields.map(f => `"${f.name.replace(/"/g, '""')}"`);
    
    // Populate sample rows for each canvas field
    const sampleRow = canvasFields.map(f => {
      if (f.type === 'text' || f.type === 'richtext') {
        const textVal = f.value || `Sample text for ${f.name}`;
        // strip html for normal textbox, keep for rich text
        const cleanVal = f.type === 'text' ? textVal.replace(/<[^>]*>/g, '') : textVal;
        return `"${cleanVal.toString().replace(/"/g, '""')}"`;
      }
      if (f.type === 'image') {
        return `"${(f.value || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150').replace(/"/g, '""')}"`;
      }
      return '"Sample"';
    });

    const csvText = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentProject?.name || 'auroville_canvas'}_spreadsheet_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // State machine CSV parser to support commas and quotes inside values
  const parseCSV = (text: string) => {
    const lines: string[] = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i+1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push("");
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(JSON.stringify(row));
        row = [""];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(JSON.stringify(row));
    }

    if (lines.length === 0) return { headers: [], rows: [] };
    
    try {
      const parsedHeaders = JSON.parse(lines[0]) as string[];
      const parsedRows = lines.slice(1).map(line => {
        try {
          const values = JSON.parse(line) as string[];
          const rowObj: any = {};
          parsedHeaders.forEach((header: string, idx: number) => {
            rowObj[header] = values[idx] || '';
          });
          return rowObj;
        } catch (err) {
          return null;
        }
      }).filter(Boolean);

      return { headers: parsedHeaders, rows: parsedRows };
    } catch (e) {
      console.error(e);
      return { headers: [], rows: [] };
    }
  };

  // Helper to apply dynamic values to the canvas for a single row
  const applyRowDataToCanvas = async (rowObj: any) => {
    if (!canvas) return;

    for (const field of canvasFields) {
      const cellValue = rowObj[field.name];
      if (cellValue !== undefined && cellValue !== null) {
        const obj = canvas.getObjects().find(o => (o as any).id === field.id);
        if (!obj) continue;

        if (field.type === 'text') {
          (obj as any).set('text', cellValue.toString());
        } else if (field.type === 'richtext') {
          const styles = (obj as any).styleOptions || DEFAULT_RICH_TEXT_STYLES;
          (obj as any).htmlContent = cellValue.toString();
          const dataUrl = renderHtmlToDataUrl(cellValue.toString(), obj.width || 380, obj.height || 230, styles);
          await (obj as fabric.Image).setSrc(dataUrl);
        } else if (field.type === 'image') {
          await (obj as fabric.Image).setSrc(cellValue.toString());
        }
      }
    }
    canvas.renderAll();
    triggerCanvasRefresh();
  };

  const loadRow = async (idx: number) => {
    if (idx < 0 || idx >= csvData.length) return;
    setActiveRowIndex(idx);
    await applyRowDataToCanvas(csvData[idx]);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const { headers, rows } = parseCSV(text);
      if (headers.length > 0) {
        setCsvHeaders(headers);
        setCsvData(rows);
        setActiveRowIndex(0);
        setRowStatuses({});
        applyRowDataToCanvas(rows[0]);
      } else {
        alert("Could not parse file. Make sure it's a valid CSV file with headers matching your canvas fields.");
      }
    };
    reader.readAsText(file);
  };

  const exportRowState = async (idx: number) => {
    if (!canvas || !csvData[idx]) return;

    // Deselect active object to avoid exporting selection handles
    canvas.discardActiveObject();
    canvas.renderAll();

    // Small delay to ensure render is updated
    await new Promise(resolve => setTimeout(resolve, 150));

    const row = csvData[idx];
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1.0,
      multiplier: batchExportMultiplier
    });

    const link = document.createElement('a');
    // Use the value of the first field or the index for the filename suffix
    const recordKey = row[canvasFields[0]?.name] || `item_${idx + 1}`;
    const suffix = recordKey.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${currentProject?.name || 'batch'}_${suffix}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Mark as exported
    setRowStatuses(prev => ({ ...prev, [idx]: 'exported' }));
  };

  const handleExportAndNext = async () => {
    if (activeRowIndex === null || !canvas) return;
    await exportRowState(activeRowIndex);
    const nextIdx = activeRowIndex + 1;
    if (nextIdx < csvData.length) {
      await loadRow(nextIdx);
    } else {
      alert("🎉 All records in the batch have been processed!");
    }
  };

  const handleSkipAndNext = async () => {
    if (activeRowIndex === null) return;
    setRowStatuses(prev => ({ ...prev, [activeRowIndex]: 'skipped' }));
    const nextIdx = activeRowIndex + 1;
    if (nextIdx < csvData.length) {
      await loadRow(nextIdx);
    } else {
      alert("🎉 All records in the batch have been processed!");
    }
  };

  const handlePreviousRow = async () => {
    if (activeRowIndex === null || activeRowIndex <= 0) return;
    await loadRow(activeRowIndex - 1);
  };

  const handleNextRow = async () => {
    if (activeRowIndex === null || activeRowIndex >= csvData.length - 1) return;
    await loadRow(activeRowIndex + 1);
  };



  const { 
    projects,
    activeProjectId,
    canvasVersion, 
    triggerCanvasRefresh,
    setSelectedObjectId,
    saveActiveProjectToStorage,
    updateActiveProjectDimensions
  } = useEditorStore();

  const canvas = canvasRef.current;
  const currentProject = projects.find(p => p.id === activeProjectId);

  // Retrieve objects currently in canvas to render in Layers panel (ordered top-to-bottom for user readability)
  const canvasObjects = canvas ? [...canvas.getObjects()].reverse() : [];

  // Keep fields list in sync with the active canvas
  const refreshCanvasFields = () => {
    if (!canvas) {
      setCanvasFields([]);
      return;
    }
    const objects = canvas.getObjects();
    const fields = objects.map(obj => {
      const isTxt = obj.type === 'textbox' || obj.type?.includes('text');
      const isImg = obj.type === 'image';
      
      let type: 'text' | 'image' | 'other' = 'other';
      if (isTxt) type = 'text';
      else if (isImg) type = 'image';

      return {
        id: (obj as any).id || (obj as any).get?.('id') || '',
        name: obj.get('name') || (obj as any).name || `${isTxt ? 'Text' : isImg ? 'Image/Logo' : 'Element'}`,
        type,
        value: isTxt ? (obj as any).text || '' : (obj as any).getSrc?.() || '',
        object: obj
      };
    }).filter(f => f.type !== 'other' && f.id);
    
    setCanvasFields(fields);
  };

  useEffect(() => {
    if (!canvas) {
      setCanvasFields([]);
      return;
    }
    
    const handleUpdate = () => {
      refreshCanvasFields();
    };

    canvas.on('object:added', handleUpdate);
    canvas.on('object:removed', handleUpdate);
    canvas.on('object:modified', handleUpdate);
    canvas.on('selection:created', handleUpdate);
    canvas.on('selection:updated', handleUpdate);
    canvas.on('selection:cleared', handleUpdate);
    
    refreshCanvasFields();

    return () => {
      canvas.off('object:added', handleUpdate);
      canvas.off('object:removed', handleUpdate);
      canvas.off('object:modified', handleUpdate);
      canvas.off('selection:created', handleUpdate);
      canvas.off('selection:updated', handleUpdate);
      canvas.off('selection:cleared', handleUpdate);
    };
  }, [canvas, canvasVersion]);

  // 1. Handlers for uploading and deleting custom logos
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const newLogo = { name: file.name, data };
      const updated = [newLogo, ...uploadedLogos];
      setUploadedLogos(updated);
      localStorage.setItem('avfi_uploaded_logos', JSON.stringify(updated));
      
      // Also instantly place it on the canvas!
      handleAddUploadedLogo(data, file.name);
    };
    reader.readAsDataURL(file);
  };
  
  const handleAddUploadedLogo = (dataUrl: string, name: string) => {
    if (!canvas) return;
    fabric.Image.fromURL(dataUrl, {}, {}).then((imgObj) => {
      const canvasWidth = canvas.width || 800;
      const scale = Math.min(180 / imgObj.width!, 1);
      
      imgObj.set({
        left: (canvasWidth - imgObj.width! * scale) / 2,
        top: 100,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        id: `img_logo_${Date.now()}`,
        name: name || 'Logo',
        lockUniScaling: true
      });
      imgObj.setControlsVisibility({
        ml: false,
        mr: false,
        mt: false,
        mb: false
      });
      canvas.add(imgObj);
      canvas.setActiveObject(imgObj);
      canvas.renderAll();
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    });
  };

  const handleDeleteUploadedLogo = (index: number) => {
    const updated = uploadedLogos.filter((_, idx) => idx !== index);
    setUploadedLogos(updated);
    localStorage.setItem('avfi_uploaded_logos', JSON.stringify(updated));
  };

  // 2. Handlers for updating fields from sidebar template forms
  const handleUpdateTextField = (objId: string, text: string) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find(o => (o as any).id === objId);
    if (obj && (obj.type === 'textbox' || obj.type?.includes('text'))) {
      (obj as fabric.Textbox).set('text', text);
      canvas.renderAll();
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    }
  };



  const handleUpdateImageField = (objId: string, file: File) => {
    if (!canvas || !file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const obj = canvas.getObjects().find(o => (o as any).id === objId);
      if (obj && obj.type === 'image') {
        (obj as fabric.Image).setSrc(data).then(() => {
          canvas.renderAll();
          triggerCanvasRefresh();
          saveActiveProjectToStorage(canvas.toJSON().objects || []);
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateFieldScale = (objId: string, scalePct: number) => {
    if (!canvas) return;
    const obj = canvas.getObjects().find(o => (o as any).id === objId);
    if (obj) {
      const baseScale = scalePct / 100;
      obj.set({
        scaleX: baseScale,
        scaleY: baseScale
      });
      canvas.renderAll();
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    }
  };

  // 3. Handlers for Saving and Loading templates
  const handleSaveAsTemplate = () => {
    if (!canvas) return;
    const name = newTemplateName.trim() || `Template ${customTemplates.length + 1}`;
    const objects = canvas.toJSON().objects || [];
    
    const newTemplate = {
      id: `template_${Date.now()}`,
      name,
      date: Date.now(),
      objects
    };
    
    const updated = [newTemplate, ...customTemplates];
    setCustomTemplates(updated);
    localStorage.setItem('avfi_custom_templates', JSON.stringify(updated));
    setNewTemplateName('');
  };

  const handleLoadTemplate = (tpl: any) => {
    if (!canvas) return;
    const confirmLoad = window.confirm(`Loading template "${tpl.name}" will replace all existing objects on your canvas. Proceed?`);
    if (!confirmLoad) return;
    
    // Dynamically adjust active project dimensions if defined in template!
    if (tpl.width && tpl.height) {
      updateActiveProjectDimensions('CUSTOM', tpl.width, tpl.height);
    }

    canvas.clear();
    const currentPageBg = tpl.backgroundColor || currentProject?.pages[currentProject.activePageIndex || 0]?.backgroundColor || '#ffffff';
    canvas.backgroundColor = currentPageBg;
    
    const jsonStr = JSON.stringify({ objects: tpl.objects });
    canvas.loadFromJSON(jsonStr).then(() => {
      canvas.renderAll();
      triggerCanvasRefresh();
      saveActiveProjectToStorage(canvas.toJSON().objects || []);
    });
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDel = window.confirm("Are you sure you want to delete this template?");
    if (!confirmDel) return;
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    localStorage.setItem('avfi_custom_templates', JSON.stringify(updated));
  };

  // 1. Add Custom Text Helper
  const handleAddText = () => {
    if (!canvas) return;
    const textObj = new fabric.Textbox('Double click to edit text...', {
      left: 100,
      top: 100,
      width: 400,
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      fill: '#111111',
      textAlign: 'left'
    });
    // Set a random unique ID to keep tracking robust
    textObj.set('id', `text_${Date.now()}`);
    textObj.set('name', 'Plain Text Block');
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    triggerCanvasRefresh();
  };



  // 2. Add Shape Helpers
  const handleAddShape = (shapeType: 'rect' | 'circle' | 'line') => {
    if (!canvas) return;
    let shape: fabric.Object;

    if (shapeType === 'rect') {
      shape = new fabric.Rect({
        left: 150,
        top: 150,
        width: 150,
        height: 150,
        fill: '#d4af37',
        strokeWidth: 0
      });
      shape.set('name', 'Rectangle shape');
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({
        left: 150,
        top: 150,
        radius: 75,
        fill: '#111111',
        strokeWidth: 0
      });
      shape.set('name', 'Circle shape');
    } else {
      shape = new fabric.Rect({
        left: 150,
        top: 150,
        width: 250,
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
  };

  // 4. File Upload Handler for Custom Images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data, {}, {}).then((imgObj) => {
        // scale image to fit nicely within standard screen widths
        const canvasWidth = canvas.width || 800;
        const scale = Math.min(350 / imgObj.width!, 1);
        
        imgObj.set({
          left: (canvasWidth - imgObj.width! * scale) / 2,
          top: 150,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          id: `img_${Date.now()}`,
          name: file.name,
          lockUniScaling: true
        });
        imgObj.setControlsVisibility({
          ml: false,
          mr: false,
          mt: false,
          mb: false
        });
        canvas.add(imgObj);
        canvas.setActiveObject(imgObj);
        canvas.renderAll();
        triggerCanvasRefresh();
      });
    };
    reader.readAsDataURL(file);
  };

  // 6. Layer Panel Manipulation Actions
  const handleToggleVisible = (obj: fabric.Object) => {
    obj.set('visible', !obj.visible);
    canvas?.renderAll();
    triggerCanvasRefresh();
    // Update save state
    if (canvas) saveActiveProjectToStorage(canvas.toJSON().objects || []);
  };

  const handleToggleLock = (obj: fabric.Object) => {
    const newLocked = !obj.lockMovementX;
    obj.set({
      lockMovementX: newLocked,
      lockMovementY: newLocked,
      lockScalingX: newLocked,
      lockScalingY: newLocked,
      lockRotation: newLocked,
      hasControls: !newLocked,
      selectable: !newLocked
    });
    canvas?.renderAll();
    triggerCanvasRefresh();
    // Update save state
    if (canvas) saveActiveProjectToStorage(canvas.toJSON().objects || []);
  };

  const handleMoveLayer = (obj: fabric.Object, direction: 'up' | 'down') => {
    if (!canvas) return;
    if (direction === 'up') {
      (canvas as any).bringForward(obj);
    } else {
      (canvas as any).sendBackwards(obj);
    }
    canvas.renderAll();
    triggerCanvasRefresh();
    saveActiveProjectToStorage(canvas.toJSON().objects || []);
  };

  const handleDuplicateLayer = (obj: fabric.Object) => {
    if (!canvas) return;
    obj.clone().then((cloned) => {
      cloned.set({
        left: (obj.left || 0) + 30,
        top: (obj.top || 0) + 30,
        id: `obj_${Date.now()}`,
        name: `${obj.get('name') || obj.type} (Copy)`
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      triggerCanvasRefresh();
    });
  };

  const handleDeleteLayer = (obj: fabric.Object) => {
    if (!canvas) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObjectId(null, null);
    triggerCanvasRefresh();
  };

  const handleRenameLayer = (obj: fabric.Object) => {
    const currentName = obj.get('name') || obj.type || 'Object';
    const newName = prompt('Enter a new layer name:', currentName);
    if (newName) {
      obj.set('name', newName);
      canvas?.renderAll();
      triggerCanvasRefresh();
      if (canvas) saveActiveProjectToStorage(canvas.toJSON().objects || []);
    }
  };

  return (
    <div className="w-full h-full bg-white border-r border-stone-200 flex flex-col select-none">
      {/* Tab Selectors */}
      <div className="h-12 border-b border-stone-100 flex items-center px-1.5 gap-1 bg-stone-50">
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-1.5 px-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'assets' 
              ? 'bg-white shadow-sm text-stone-900 border border-stone-200' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ImageIcon className="w-3 h-3 text-stone-600" />
          Assets
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 py-1.5 px-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'templates' 
              ? 'bg-white shadow-sm text-stone-900 border border-stone-200' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Quote className="w-3 h-3 text-stone-600" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 px-1 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all relative ${
            activeTab === 'layers' 
              ? 'bg-white shadow-sm text-stone-900 border border-stone-200' 
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Layers className="w-3 h-3 text-stone-600" />
          Layers
          {canvasObjects.length > 0 && (
            <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-[#d4af37] rounded-full" />
          )}
        </button>
      </div>

      {/* Panel Views */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'assets' && (
          <div className="space-y-6">
            {/* Quick Add Blocks */}
            <div>
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3">Add Core Objects</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddText}
                  className="border border-stone-200 hover:border-[#d4af37] rounded-lg p-2.5 text-center text-xs font-bold text-stone-700 bg-white hover:bg-[#d4af37]/5 transition-all"
                >
                  Add TextBox
                </button>
                <button
                  onClick={() => handleAddShape('rect')}
                  className="border border-stone-200 hover:border-[#d4af37] rounded-lg p-2.5 text-center text-xs font-bold text-stone-700 bg-white hover:bg-[#d4af37]/5 transition-all"
                >
                  Rectangle
                </button>
                <button
                  onClick={() => handleAddShape('circle')}
                  className="border border-stone-200 hover:border-[#d4af37] rounded-lg p-2.5 text-center text-xs font-bold text-stone-700 bg-white hover:bg-[#d4af37]/5 transition-all"
                >
                  Circle
                </button>
                <button
                  onClick={() => handleAddShape('line')}
                  className="border border-stone-200 hover:border-[#d4af37] rounded-lg p-2.5 text-center text-xs font-bold text-stone-700 bg-white hover:bg-[#d4af37]/5 transition-all"
                >
                  Line/Rule
                </button>
              </div>
            </div>

            {/* Upload Custom Image & Logo Zone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">My Logos & Images</h3>
                <label className="text-[10px] text-amber-500 hover:text-[#c29f2f] font-bold cursor-pointer flex items-center gap-1 transition-all">
                  <Upload className="w-3 h-3" />
                  Upload Logo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                  />
                </label>
              </div>

              {/* Uploaded logo gallery grid list */}
              {uploadedLogos.length === 0 ? (
                <div className="border border-dashed border-stone-200 rounded-lg p-4 text-center text-stone-400 text-[10px] italic bg-stone-50/50 mb-4">
                  No logos uploaded yet. Click "Upload Logo" to place yours!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 mb-4">
                  {uploadedLogos.map((logo, index) => (
                    <div key={index} className="group relative border border-stone-200 hover:border-[#d4af37] rounded-lg p-1.5 flex flex-col items-center bg-white hover:bg-[#d4af37]/5 transition-all text-[10px] font-semibold text-stone-600 shadow-sm">
                      <button
                        onClick={() => handleAddUploadedLogo(logo.data, logo.name)}
                        className="w-full h-16 flex items-center justify-center p-1 bg-stone-50 rounded overflow-hidden"
                        title="Add this logo to canvas"
                      >
                        <img src={logo.data} alt={logo.name} className="max-w-full max-h-full object-contain" />
                      </button>
                      <span className="truncate w-full text-center mt-1 text-[9px] text-stone-500 block px-0.5">{logo.name}</span>
                      <button
                        onClick={() => handleDeleteUploadedLogo(index)}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow hover:bg-red-600"
                        title="Delete logo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">Active Document Layers</h3>
            {canvasObjects.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-xs italic">
                No objects on the canvas yet.
              </div>
            ) : (
              <div className="space-y-1">
                {canvasObjects.map((obj, index) => {
                  const isSelected = canvas?.getActiveObject() === obj;
                  const layerName = obj.get('name') || obj.get('type') || 'Element';
                  const isLocked = !!obj.lockMovementX;
                  const isVisible = obj.visible !== false;

                  return (
                    <div 
                      key={obj.get('id') as string || index}
                      onClick={() => {
                        canvas?.setActiveObject(obj);
                        canvas?.renderAll();
                        triggerCanvasRefresh();
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-50/70 border-[#d4af37]/40 shadow-sm font-bold text-stone-900' 
                          : 'bg-white border-stone-200/60 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#d4af37] uppercase bg-stone-100 px-1 py-0.2 rounded scale-90">
                          {obj.type === 'textbox' ? 'text' : obj.type}
                        </span>
                        <span 
                          onDoubleClick={() => handleRenameLayer(obj)}
                          className="truncate text-[11px] select-all cursor-text hover:underline"
                          title="Double-click to rename"
                        >
                          {layerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* Layer Stack Reorder buttons */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveLayer(obj, 'up'); }}
                          disabled={index === 0}
                          title="Bring Layer Forward"
                          className="p-1 rounded text-stone-400 hover:text-stone-800 disabled:opacity-30 hover:bg-stone-100"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveLayer(obj, 'down'); }}
                          disabled={index === canvasObjects.length - 1}
                          title="Send Layer Backward"
                          className="p-1 rounded text-stone-400 hover:text-stone-800 disabled:opacity-30 hover:bg-stone-100"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Visibility and Lock buttons */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleVisible(obj); }}
                          className={`p-1 rounded ${isVisible ? 'text-stone-500 hover:bg-stone-100' : 'text-stone-300'}`}
                        >
                          {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleLock(obj); }}
                          className={`p-1 rounded ${isLocked ? 'text-amber-500' : 'text-stone-300 hover:bg-stone-100'}`}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>

                        {/* Layer Actions */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateLayer(obj); }}
                          title="Duplicate Layer"
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteLayer(obj); }}
                          title="Delete Layer"
                          className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xs font-bold text-stone-800 uppercase tracking-wide mb-1">Interactive Template Engine</h2>
              <p className="text-[10px] text-stone-500 leading-normal">
                Place assets on your canvas, set it as a reusable template, then fill it dynamically with data, edit scale and export!
              </p>
            </div>

            {/* Template Creator */}
            <div className="border border-stone-200 rounded-lg p-3 bg-stone-50/50 space-y-2.5 shadow-sm">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Set Current Canvas as Template</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Template Name (e.g. My Quote Layout)..."
                  className="flex-1 text-xs font-semibold border border-stone-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#d4af37] bg-white text-stone-700"
                />
                <button
                  onClick={handleSaveAsTemplate}
                  className="py-1.5 px-3 bg-amber-500 hover:bg-[#c29f2f] text-white font-bold text-xs rounded transition-all shadow-sm"
                >
                  Save
                </button>
              </div>

              {/* Prebuilt Default Templates list selector */}
              <div className="pt-2.5 border-t border-stone-200">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">Intelligent Starter Templates</span>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {DEFAULT_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleLoadTemplate(tpl)}
                      className="group flex items-center justify-between p-2 border border-stone-200 hover:border-[#d4af37] rounded-lg bg-white hover:bg-amber-50/20 cursor-pointer transition-all shadow-sm"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold text-stone-800 truncate">{tpl.name}</span>
                        <span className="text-[8px] text-stone-400 font-mono">
                          {tpl.width}×{tpl.height} • {tpl.objects.length} layers
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-amber-500 group-hover:underline">Load</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved templates list selector */}
              {customTemplates.length > 0 && (
                <div className="pt-2.5 border-t border-stone-200">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">My Reusable Templates</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {customTemplates.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => handleLoadTemplate(tpl)}
                        className="group flex items-center justify-between p-2 border border-stone-200 hover:border-[#d4af37] rounded bg-white hover:bg-[#d4af37]/5 cursor-pointer transition-all"
                      >
                        <span className="text-[10px] font-bold text-stone-700 truncate max-w-[150px]">{tpl.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] font-bold text-stone-400 font-mono">
                            {tpl.objects?.length || 0} layers
                          </span>
                          <button
                            onClick={(e) => handleDeleteTemplate(tpl.id, e)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all p-0.5"
                            title="Delete template"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Template Dynamic Form Filler */}
            <div>
              <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2.5">Fill Template Data</h3>
              
              {canvasFields.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-stone-200 rounded-lg p-4 bg-stone-50 text-[11px] text-stone-500 italic">
                  Add some Core Objects (TextBox, Rich Text, or Logo/Image) to begin filling your template fields dynamically.
                </div>
              ) : (
                <div className="space-y-4">
                  {canvasFields.map((field) => (
                    <div key={field.id} className="border border-stone-200 rounded-lg p-3 bg-stone-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1.5">
                          {field.type === 'richtext' && <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />}
                          {field.type === 'text' && <Type className="w-3.5 h-3.5 text-stone-500" />}
                          {field.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-stone-500" />}
                          {field.name}
                        </span>
                        <button
                          onClick={() => {
                            if (canvas) {
                              const foundObj = canvas.getObjects().find(o => (o as any).id === field.id);
                              if (foundObj) {
                                canvas.setActiveObject(foundObj);
                                canvas.renderAll();
                                triggerCanvasRefresh();
                              }
                            }
                          }}
                          className="text-[9px] font-bold text-amber-500 hover:underline"
                        >
                          Select Layer
                        </button>
                      </div>

                      {/* Direct field input controllers */}
                      {field.type === 'text' && (
                        <textarea
                          value={field.value}
                          onChange={(e) => handleUpdateTextField(field.id, e.target.value)}
                          rows={2}
                          className="w-full text-xs font-semibold border border-stone-200 rounded p-1.5 focus:outline-none focus:border-[#d4af37] bg-white text-stone-700"
                          placeholder="Edit text content..."
                        />
                      )}



                      {field.type === 'image' && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {field.value ? (
                              <img src={field.value} className="w-10 h-10 object-contain border border-stone-200 rounded bg-white shrink-0" />
                            ) : (
                              <div className="w-10 h-10 border border-stone-200 rounded bg-stone-100 flex items-center justify-center text-[10px] text-stone-400 shrink-0">✕</div>
                            )}
                            <label className="flex-1 py-1.5 px-2 border border-stone-200 rounded hover:border-[#d4af37] cursor-pointer text-center text-[10px] font-bold text-stone-600 bg-white hover:bg-[#d4af37]/5 transition-all">
                              Replace Image / Logo
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleUpdateImageField(field.id, file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Precise Object Scale Controller */}
                      <div className="space-y-1 pt-1.5 border-t border-stone-100">
                        <div className="flex items-center justify-between text-[9px] font-bold text-stone-400 uppercase">
                          <span>Scale</span>
                          <span className="font-mono text-stone-600 font-bold">
                            {Math.round((field.object.scaleX || 1) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="300"
                          value={Math.round((field.object.scaleX || 1) * 100)}
                          onChange={(e) => handleUpdateFieldScale(field.id, parseInt(e.target.value))}
                          className="w-full accent-amber-500 h-1 bg-stone-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 👤 Batch Spreadsheet populating tool */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-stone-500" />
                  Spreadsheet Batch tool
                </h3>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Download a pre-structured spreadsheet template matching your canvas fields, load multiple rows, and batch compile!
                </p>
              </div>

              {canvasFields.length === 0 ? (
                <div className="text-center p-3.5 border border-dashed border-stone-200 rounded-lg bg-stone-50 text-[10px] text-stone-400 italic">
                  Create textbox layers or images first to use the spreadsheet tool.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Download Template CSV button */}
                  <button
                    onClick={handleDownloadCsvTemplate}
                    className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 border border-stone-300/40 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    Download CSV Template
                  </button>

                  {/* Upload CSV Selector */}
                  <div className="relative">
                    <label className="w-full py-2 px-3 border-2 border-dashed border-stone-200 hover:border-[#d4af37] bg-white hover:bg-amber-50/5 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center text-center">
                      <Upload className="w-5 h-5 text-[#d4af37] mb-1" />
                      <span className="text-[10px] font-bold text-stone-700">Upload Populated Spreadsheet</span>
                      <span className="text-[9px] text-stone-400">Drag or click to choose .csv file</span>
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCsvFileUpload}
                      />
                    </label>
                  </div>

                  {/* If CSV data loaded, render scrollable row list with Preview and Batch Export triggers */}
                  {csvData.length > 0 && (
                    <div className="border border-stone-200 rounded-lg bg-white overflow-hidden shadow-xs space-y-3 p-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                        <span>Row-by-Row Review Wizard</span>
                        <button
                          onClick={() => { 
                            setCsvData([]); 
                            setCsvHeaders([]); 
                            setActiveRowIndex(null); 
                            setRowStatuses({});
                          }}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          Clear CSV
                        </button>
                      </div>

                      {/* Progress Stats Card */}
                      {activeRowIndex !== null && (
                        <div className="bg-stone-50 border border-stone-150 rounded-lg p-2.5 space-y-1.5 text-xs">
                          <div className="flex justify-between font-semibold text-stone-700">
                            <span>Record {activeRowIndex + 1} of {csvData.length}</span>
                            <span className="text-stone-400 text-[10px] font-mono">
                              {Object.values(rowStatuses).filter(s => s === 'exported').length} exported
                            </span>
                          </div>
                          
                          {/* Mini Progress Bar */}
                          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#d4af37] h-full transition-all duration-300"
                              style={{ width: `${((activeRowIndex + 1) / csvData.length) * 100}%` }}
                            />
                          </div>

                          <div className="truncate font-bold text-[#d4af37] text-[11px] pt-0.5">
                            Active: {csvData[activeRowIndex][canvasFields[0]?.name] || `Row #${activeRowIndex + 1}`}
                          </div>
                        </div>
                      )}

                      {/* Main Wizard Control Action Buttons */}
                      {activeRowIndex !== null && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            <button
                              onClick={handlePreviousRow}
                              disabled={activeRowIndex === 0}
                              className="py-1.5 px-2 border border-stone-200 rounded-md text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-[10px] text-center transition-all cursor-pointer"
                            >
                              ← Prev
                            </button>
                            <button
                              onClick={handleNextRow}
                              disabled={activeRowIndex === csvData.length - 1}
                              className="py-1.5 px-2 border border-stone-200 rounded-md text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-[10px] text-center transition-all cursor-pointer"
                            >
                              Next →
                            </button>
                          </div>

                          <div className="flex gap-1.5">
                            <button
                              onClick={handleSkipAndNext}
                              className="flex-1 py-2 px-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-600 font-bold text-[10px] rounded-lg transition-all text-center cursor-pointer"
                              title="Skip this row without exporting and go to next"
                            >
                              Skip Row
                            </button>
                            
                            <button
                              onClick={handleExportAndNext}
                              className="flex-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md uppercase tracking-wider"
                              title="Export current canvas state as PNG and load next row"
                            >
                              Export & Next
                            </button>
                          </div>

                          {/* Export Resolution Picker */}
                          <div className="flex items-center justify-between text-[9px] font-bold text-stone-400 pt-1 border-t border-stone-100">
                            <span>EXPORT RESOLUTION</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setBatchExportMultiplier(1.0)}
                                className={`px-1.5 py-0.5 rounded border transition-all text-[9px] font-bold ${
                                  batchExportMultiplier === 1.0 
                                    ? 'bg-amber-500 text-white border-amber-500' 
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                }`}
                              >
                                1x (Std)
                              </button>
                              <button
                                onClick={() => setBatchExportMultiplier(2.0)}
                                className={`px-1.5 py-0.5 rounded border transition-all text-[9px] font-bold ${
                                  batchExportMultiplier === 2.0 
                                    ? 'bg-amber-500 text-white border-amber-500' 
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                                }`}
                              >
                                2x (Print)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Records List Section */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Record List & Statuses</span>
                        <div className="max-h-44 overflow-y-auto border border-stone-100 rounded divide-y divide-stone-100 pr-1">
                          {csvData.map((row, idx) => {
                            const isActive = activeRowIndex === idx;
                            const status = rowStatuses[idx] || 'pending';
                            const label = row[canvasFields[0]?.name] ? row[canvasFields[0]?.name].toString() : `Record #${idx + 1}`;

                            return (
                              <div 
                                key={idx} 
                                onClick={() => loadRow(idx)}
                                className={`p-2 flex items-center justify-between gap-2 hover:bg-stone-50 cursor-pointer transition-all text-[11px] ${
                                  isActive 
                                    ? 'bg-amber-50/70 border-l-2 border-[#d4af37] font-bold text-stone-900' 
                                    : 'text-stone-600'
                                }`}
                              >
                                <span className="truncate flex-1 max-w-[170px]" title={label}>
                                  {label}
                                </span>
                                
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {status === 'exported' && (
                                    <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5" title="Exported successfully">
                                      ✓ <span className="text-[8px] uppercase tracking-tight hidden sm:inline">Exported</span>
                                    </span>
                                  )}
                                  {status === 'skipped' && (
                                    <span className="text-amber-500 text-[10px] font-bold flex items-center gap-0.5" title="Skipped">
                                      ↷ <span className="text-[8px] uppercase tracking-tight hidden sm:inline">Skipped</span>
                                    </span>
                                  )}
                                  {status === 'pending' && (
                                    <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" title="Pending" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>


                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
