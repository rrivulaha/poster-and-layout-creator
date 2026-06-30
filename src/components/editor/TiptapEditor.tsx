/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  Heading1,
  Heading2,
  Heading3,
  List as ListIcon,
  ListOrdered as OrderedListIcon,
  Quote as QuoteIcon,
  Code as CodeIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

// Extend Tiptap Paragraph node to handle 5 styles of alignment natively
const ExtendedParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: element => {
          const textAlign = element.style.textAlign;
          const textAlignLast = element.style.textAlignLast;
          if (textAlign === 'justify' && textAlignLast === 'justify') {
            return 'force-justify';
          }
          return textAlign || 'left';
        },
        renderHTML: attributes => {
          if (attributes.align === 'force-justify') {
            return { style: 'text-align: justify; text-align-last: justify;' };
          }
          if (attributes.align && attributes.align !== 'left') {
            return { style: `text-align: ${attributes.align};` };
          }
          return {};
        }
      }
    };
  }
});

// Extend Tiptap Heading node to handle 5 styles of alignment natively
const ExtendedHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: element => {
          const textAlign = element.style.textAlign;
          const textAlignLast = element.style.textAlignLast;
          if (textAlign === 'justify' && textAlignLast === 'justify') {
            return 'force-justify';
          }
          return textAlign || 'left';
        },
        renderHTML: attributes => {
          if (attributes.align === 'force-justify') {
            return { style: 'text-align: justify; text-align-last: justify;' };
          }
          if (attributes.align && attributes.align !== 'left') {
            return { style: `text-align: ${attributes.align};` };
          }
          return {};
        }
      }
    };
  }
});

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing rich text...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default paragraph and heading so our extended versions are used cleanly
        paragraph: false,
        heading: false,
      }),
      ExtendedParagraph,
      ExtendedHeading,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[140px] max-h-[220px] overflow-y-auto p-3 text-xs bg-stone-50 border border-t-0 border-stone-200 rounded-b-lg font-medium text-stone-800'
      }
    }
  });

  // Sync value from parent if it changes from outside (e.g. object selection change)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="animate-pulse bg-stone-100 border border-stone-200 rounded-lg h-40 flex items-center justify-center text-xs text-stone-400">
        Loading rich text editor...
      </div>
    );
  }

  // Toggles the alignment on both paragraphs and headings
  const setAlignment = (alignment: 'left' | 'center' | 'right' | 'justify' | 'force-justify') => {
    editor
      .chain()
      .focus()
      .updateAttributes('paragraph', { align: alignment })
      .updateAttributes('heading', { align: alignment })
      .run();
  };

  const isAlignmentActive = (alignment: 'left' | 'center' | 'right' | 'justify' | 'force-justify') => {
    return (
      editor.isActive('paragraph', { align: alignment }) ||
      editor.isActive('heading', { align: alignment })
    );
  };

  return (
    <div className="w-full flex flex-col rounded-lg border border-stone-200 overflow-hidden shadow-sm">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-1 items-center bg-stone-100 border-b border-stone-200 p-1.5 select-none">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('bold') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('italic') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-3.5 h-3.5" />
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('strike') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Strikethrough"
        >
          <StrikeIcon className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-stone-200 mx-1" />

        {/* Heading 1 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>

        {/* Heading 2 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        {/* Heading 3 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-stone-200 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Bullet List"
        >
          <ListIcon className="w-3.5 h-3.5" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Numbered List"
        >
          <OrderedListIcon className="w-3.5 h-3.5" />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Blockquote"
        >
          <QuoteIcon className="w-3.5 h-3.5" />
        </button>

        {/* Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            editor.isActive('code') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Inline Code"
        >
          <CodeIcon className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-stone-200 mx-1" />

        {/* Align Left */}
        <button
          type="button"
          onClick={() => setAlignment('left')}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            isAlignmentActive('left') || (!isAlignmentActive('center') && !isAlignmentActive('right') && !isAlignmentActive('justify') && !isAlignmentActive('force-justify'))
              ? 'bg-amber-500/15 text-[#d4af37]'
              : 'text-stone-600'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        {/* Align Center */}
        <button
          type="button"
          onClick={() => setAlignment('center')}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            isAlignmentActive('center') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        {/* Align Right */}
        <button
          type="button"
          onClick={() => setAlignment('right')}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            isAlignmentActive('right') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        {/* Align Justify */}
        <button
          type="button"
          onClick={() => setAlignment('justify')}
          className={`p-1.5 rounded hover:bg-stone-200 transition-colors ${
            isAlignmentActive('justify') ? 'bg-amber-500/15 text-[#d4af37]' : 'text-stone-600'
          }`}
          title="Align Justify (Standard)"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        {/* Force Justify */}
        <button
          type="button"
          onClick={() => setAlignment('force-justify')}
          className={`p-1.5 rounded hover:bg-stone-200 transition-all ${
            isAlignmentActive('force-justify') ? 'bg-amber-500/25 border border-amber-500/30 text-[#d4af37] font-bold' : 'text-stone-600'
          } flex items-center gap-0.5`}
          title="Force Justify (Aligns all lines including last line)"
        >
          <AlignJustify className="w-3.5 h-3.5" />
          <span className="text-[8px] tracking-tight leading-none px-0.5 bg-amber-500/10 text-[#d4af37] rounded font-bold">FORCE</span>
        </button>

        <div className="w-[1px] h-4 bg-stone-200 mx-1" />

        {/* Undo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-500 disabled:opacity-40"
          title="Undo"
        >
          <UndoIcon className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-stone-200 transition-colors text-stone-500 disabled:opacity-40"
          title="Redo"
        >
          <RedoIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* EDITOR WORKSPACE */}
      <EditorContent editor={editor} />
    </div>
  );
};
