/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Supported core object types in the publisher system.
 * We use an open-ended string union pattern (string & {}) to maintain autocomplete for core types
 * while fully supporting arbitrary custom/future types without breaking compatibility.
 */
export type ObjectType = 
  | 'text'
  | 'image'
  | 'rect'
  | 'circle'
  | 'line'
  | 'group'
  | 'logo'
  | (string & {});

/**
 * Standard horizontal alignment options for text and other elements.
 */
export type HorizontalAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Standard vertical alignment options.
 */
export type VerticalAlign = 'top' | 'middle' | 'bottom';

/**
 * Metadata map for custom properties, institutional roles, or future extensions.
 * This guarantees that new features or CMS fields can be stored inside objects
 * without modifying the core TypeScript definitions.
 */
export interface ObjectMetadata {
  role?: string;            // e.g., "primary-headline", "disclaimer", "branding-logo"
  isExportable?: boolean;   // Control whether layer is omitted in final print or download
  createdAt?: number;
  [key: string]: unknown;   // Allows any custom key-value pairs
}

/**
 * 1. BaseObject
 * Represents the baseline schema shared by ALL objects on the canvas.
 * Handles primary geometric transformations, layer naming, state tracking, and extensibility.
 */
export interface BaseObject {
  id: string;               // Unique identifier (UUID recommended)
  type: ObjectType;         // The runtime discriminator
  name: string;             // Display name in the Layers Panel (e.g., "Main Quote", "Background Rect")
  
  // Positional and Geometric Transform Properties (compatible with Fabric.js coordinates)
  left: number;             // X coordinate of the object bounding box
  top: number;              // Y coordinate of the object bounding box
  width: number;            // Nominal width of the object
  height: number;           // Nominal height of the object
  scaleX: number;           // Horizontal scale multiplier
  scaleY: number;           // Vertical scale multiplier
  angle: number;            // Rotation angle in degrees (0 to 360)
  
  // Styling and Presentation
  opacity: number;          // Transparency multiplier (0.0 to 1.0)
  visible: boolean;         // Hide or show in layers
  locked: boolean;          // Locked layers cannot be selected or moved directly on the canvas
  
  // Core Extensibility Anchor
  metadata?: ObjectMetadata;
}

/**
 * 2. TextObject
 * Highly detailed properties for institutional typography and layout alignment.
 */
export interface TextObject extends BaseObject {
  type: 'text';
  content: string;          // The actual text content
  fontFamily: string;       // Font face (e.g., "Inter", "Playfair Display", "JetBrains Mono")
  fontSize: number;         // Size in pixels (or points, depending on base resolution)
  fontWeight: 'normal' | 'bold' | '300' | '500' | '600' | '700' | string | number; // Support standard and custom weight scales
  fill: string;             // Text color (HEX, RGB, or HSL string)
  backgroundColor?: string; // Highlighting/Box backdrop color behind the text
  textAlign: HorizontalAlign;
  lineHeight: number;       // Line height multiplier (e.g., 1.2, 1.5)
  charSpacing: number;      // Tracking/Letter-spacing in pixels (or Fabric's thousandths-of-em scale)
  padding: number;          // Internal bounding-box padding
  borderRadius: number;     // Corner rounding if a background color is visible
}

/**
 * 3. ImageObject (and LogoObject)
 * Supports file uploads, logos, cropping boundaries, and opacity settings.
 */
export interface ImageObject extends BaseObject {
  type: 'image' | 'logo';
  src: string;              // Base64 data-URL, blob URL, or static asset path
  borderRadius: number;     // Corner rounding for institutional visual consistency
  
  // Cropping constraints to allow non-destructive crop states
  crop?: {
    x: number;              // Offset percentage or pixels
    y: number;
    width: number;
    height: number;
  };
  
  // Custom properties to store original upload info if needed
  originalName?: string;
  originalSize?: number;
}

/**
 * 4. ShapeObject
 * Covers vectors: Rectangle, Circle, and Lines.
 */
export interface ShapeObject extends BaseObject {
  type: 'rect' | 'circle' | 'line';
  fill: string;             // Fill color
  stroke: string;           // Border/Outline color
  strokeWidth: number;      // Outline thickness
  rx?: number;              // X-axis corner radius (for rectangles)
  ry?: number;              // Y-axis corner radius (for rectangles)
}

/**
 * 5. GroupObject
 * A recursive composite object containing other objects.
 * Allows nested canvas trees, locking a banner+text unit together, or importing composite SVG templates.
 */
export interface GroupObject extends BaseObject {
  type: 'group';
  objects: AVFIObject[];    // Nesting allows fully flexible hierarchical trees
}

/**
 * Discriminated Union of all valid objects.
 * Extending the system to a new object type (e.g., "chart", "qrcode") is as simple as adding its interface
 * to this union. All rendering hooks, validators, and serialization flows will adapt instantly.
 */
export type AVFIObject = 
  | TextObject
  | ImageObject
  | ShapeObject
  | GroupObject;

/**
 * Preset configuration identifiers for different canvas dimensions.
 */
export type PagePreset =
  | 'IG_SQUARE'
  | 'IG_PORTRAIT'
  | 'STORY'
  | 'PRESENTATION'
  | 'A4_PORTRAIT'
  | 'A4_LANDSCAPE'
  | 'CUSTOM';

/**
 * 6. Page
 * Represents a single slide, card, or page in a publishing project.
 */
export interface Page {
  id: string;               // Unique ID of the page
  name: string;             // Name of page (e.g., "Page 1", "Back Cover")
  width: number;            // Pixel width
  height: number;           // Pixel height
  backgroundColor: string;  // Base canvas fill color
  objects: AVFIObject[];    // Array of canvas items (ordered bottom-to-top)
}

/**
 * 7. Template
 * A predefined page layout schema that acts as a starting point.
 */
export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'presentation' | 'institutional' | 'certificate';
  preset: PagePreset;
  width: number;
  height: number;
  pages: Omit<Page, 'id'>[]; // Templates define structure; actual Page instances get fresh IDs
  thumbnailUrl?: string;     // Preview illustration or high-res base64 string
}

/**
 * 8. Project
 * The top-level document model containing metadata, settings, pages, and save tracking.
 */
export interface Project {
  id: string;               // UUID of the document
  name: string;             // Document name (e.g., "Editorial Q3 Social Banner")
  preset: PagePreset;       // The canvas size preset selected on creation
  width: number;            // Dimensions cached at project level
  height: number;
  unit: 'px' | 'mm';        // Document measurement scale
  createdAt: number;        // Epoch timestamp
  updatedAt: number;        // Last auto-save/user-save epoch timestamp
  pages: Page[];            // List of pages (enables presentation slides or front/back cards)
  activePageIndex: number;  // The current editing focus
  previewUrl?: string;      // Cached base64 snapshot of page 1 for the dashboard grid
}
