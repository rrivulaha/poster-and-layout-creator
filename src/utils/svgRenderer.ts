/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RichTextStyleOptions {
  fontFamily: string;
  fontSize: string;
  color: string;
  lineHeight: string;
  backgroundColor: string;
  padding: string;
  borderRadius: string;
  borderWidth: string;
  borderColor: string;
  textAlign: string;
}

export const DEFAULT_RICH_TEXT_STYLES: RichTextStyleOptions = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '18px',
  color: '#111111',
  lineHeight: '1.6',
  backgroundColor: 'transparent',
  padding: '16px',
  borderRadius: '8px',
  borderWidth: '0px',
  borderColor: '#d4af37',
  textAlign: 'left'
};

/**
 * Renders HTML content (e.g. from Tiptap) into an SVG-embedded foreignObject.
 * Returns a base64 or charset-encoded Data URL.
 */
export const renderHtmlToDataUrl = (
  html: string,
  width: number,
  height: number,
  styles: Partial<RichTextStyleOptions> = {}
): string => {
  const merged = { ...DEFAULT_RICH_TEXT_STYLES, ...styles };
  
  // Escape any special raw SVG characters to make sure the data URL loads cleanly.
  // Note: We use foreignObject, which expects valid XHTML.
  // Let's wrap the HTML to ensure it has balanced tags.
  
  // Build styled container
  const styledHtml = `
    <div xmlns="http://www.w3.org/1999/xhtml" style="
      font-family: ${merged.fontFamily};
      font-size: ${merged.fontSize};
      color: ${merged.color};
      line-height: ${merged.lineHeight};
      background-color: ${merged.backgroundColor};
      text-align: ${merged.textAlign};
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: ${merged.padding};
      border-radius: ${merged.borderRadius};
      border: ${merged.borderWidth} solid ${merged.borderColor};
      overflow: hidden;
    ">
      <style>
        * { box-sizing: border-box; }
        p { margin: 0 0 8px 0; }
        p:last-child { margin-bottom: 0; }
        h1 { margin: 0 0 10px 0; font-size: 1.5em; font-weight: 800; line-height: 1.2; color: inherit; }
        h2 { margin: 0 0 8px 0; font-size: 1.3em; font-weight: 700; line-height: 1.25; color: inherit; }
        h3 { margin: 0 0 6px 0; font-size: 1.15em; font-weight: 700; line-height: 1.3; color: inherit; }
        ul { margin: 0 0 10px 0; padding-left: 20px; list-style-type: disc; }
        ol { margin: 0 0 10px 0; padding-left: 20px; list-style-type: decimal; }
        li { margin-bottom: 4px; color: inherit; }
        li p { margin-bottom: 0 !important; }
        blockquote {
          border-left: 4px solid #d4af37;
          padding-left: 12px;
          color: #4b5563;
          font-style: italic;
          margin: 10px 0;
        }
        pre {
          background-color: rgba(0,0,0,0.05);
          padding: 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
          margin: 8px 0;
          overflow-x: auto;
        }
        strong { font-weight: bold; }
        em { font-style: italic; }
        code {
          background-color: rgba(0,0,0,0.05);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
        }
      </style>
      ${html}
    </div>
  `;

  // Use base64 encoding to prevent XML parsing issues in Safari/Firefox and handle special characters
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="${width}" height="${height}">
        ${styledHtml}
      </foreignObject>
    </svg>
  `;

  // Base64 encoding ensures 100% compatibility in SVG data URLs (escaping # and other characters)
  const base64Svg = typeof window !== 'undefined' 
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64');

  return `data:image/svg+xml;base64,${base64Svg}`;
};
