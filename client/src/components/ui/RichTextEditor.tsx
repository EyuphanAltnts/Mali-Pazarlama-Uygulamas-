import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
  Code,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const { t } = useLanguage();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 underline font-semibold',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/80 text-slate-600">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('bold') ? 'bg-purple-100 text-purple-700 font-bold' : ''}`}
          title={t.actions.bold}
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('italic') ? 'bg-purple-100 text-purple-700 font-bold' : ''}`}
          title={t.actions.italic}
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('strike') ? 'bg-purple-100 text-purple-700' : ''}`}
          title={t.actions.strikethrough}
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 text-purple-700 font-bold' : ''}`}
          title={`${t.actions.heading} 1`}
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 text-purple-700 font-bold' : ''}`}
          title={`${t.actions.heading} 2`}
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('heading', { level: 3 }) ? 'bg-purple-100 text-purple-700 font-bold' : ''}`}
          title={`${t.actions.heading} 3`}
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('bulletList') ? 'bg-purple-100 text-purple-700' : ''}`}
          title={t.actions.bulletList}
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('orderedList') ? 'bg-purple-100 text-purple-700' : ''}`}
          title={t.actions.orderedList}
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg hover:bg-slate-200 transition ${editor.isActive('link') ? 'bg-purple-100 text-purple-700' : ''}`}
          title={t.actions.addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition disabled:opacity-40"
          title={t.actions.undo}
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition disabled:opacity-40"
          title={t.actions.redo}
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 min-h-[220px] max-h-[350px] overflow-y-auto text-sm text-slate-800 prose focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
