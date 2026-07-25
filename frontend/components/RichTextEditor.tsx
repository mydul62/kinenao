"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Undo,
  Redo,
  Upload,
  Highlighter,
  Palette,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  FileCode,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

// Custom Tiptap Extension to handle font-size inline styles
const FontSizeExtension = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write product description...",
}: RichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [textColor, setTextColor] = useState("#111827");
  const [highlightColor, setHighlightColor] = useState("#fef08a");
  const [selectedFontSize, setSelectedFontSize] = useState("14px");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-4 border border-rose-100 shadow-sm",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4 text-xs border border-slate-200 rounded-lg overflow-hidden",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-slate-100 font-bold p-2 text-left border border-slate-200",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "p-2 border border-slate-200",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      FontSizeExtension,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] p-4 text-slate-800 focus:outline-none bg-white font-sans text-xs leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes when appropriate
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml && (value === "" || currentHtml === "<p></p>")) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 text-slate-400 text-xs text-center animate-pulse">
        Loading Rich Text Editor...
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const file = files[0];
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const uploadedUrl = data.data.url;
      editor.chain().focus().setImage({ src: uploadedUrl }).run();
      toast.success("Image inserted into editor!");
      setShowImageModal(false);
      setImageUrl("");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const insertImageFromUrl = () => {
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageModal(false);
    setImageUrl("");
  };

  const setLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const applyFontSize = (size: string) => {
    setSelectedFontSize(size);
    if (!size || size === "14px") {
      (editor.chain().focus() as any).unsetFontSize().run();
    } else {
      (editor.chain().focus() as any).setFontSize(size).run();
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      {/* Primary Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic Font Size Dropdown & A+/A- Quick Actions */}
        <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5 mr-1">
          <select
            value={selectedFontSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-[11px] font-black rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:border-[#6C5CE7] shadow-sm"
          >
            <option value="12px">Size: 12px (Small)</option>
            <option value="14px">Size: 14px (Normal)</option>
            <option value="16px">Size: 16px (Medium)</option>
            <option value="18px">Size: 18px (Large)</option>
            <option value="22px">Size: 22px (Title)</option>
            <option value="26px">Size: 26px (Heading 2)</option>
            <option value="32px">Size: 32px (Heading 1)</option>
            <option value="40px">Size: 40px (Banner)</option>
          </select>

          <button
            type="button"
            onClick={() => applyFontSize("22px")}
            className="px-2 py-1 bg-white border border-slate-300 text-[#6C5CE7] text-[11px] font-black rounded-lg hover:bg-[#6C5CE7] hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Increase Font Size to 22px"
          >
            A+
          </button>
          <button
            type="button"
            onClick={() => applyFontSize("14px")}
            className="px-2 py-1 bg-white border border-slate-300 text-slate-700 text-[11px] font-black rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shadow-sm"
            title="Reset Font Size to 14px"
          >
            A-
          </button>
        </div>

        {/* Basic Text Formatting */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bold") ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("italic") ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("underline") ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("strike") ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        {/* Text Color & Highlight Color */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-1.5 mr-1">
          <label title="Text Color" className="flex items-center cursor-pointer p-1 rounded hover:bg-slate-200">
            <Palette className="h-4 w-4 text-[#6C5CE7] mr-1" />
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
            />
          </label>
          <label title="Text Highlight Color" className="flex items-center cursor-pointer p-1 rounded hover:bg-slate-200">
            <Highlighter className="h-4 w-4 text-amber-500 mr-1" />
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => {
                setHighlightColor(e.target.value);
                editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
              }}
              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
            />
          </label>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "left" }) ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "center" }) ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive({ textAlign: "right" }) ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>

        {/* Lists & Media */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("bulletList") ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive("orderedList") ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-200 text-slate-700"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Table Controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
            title="Insert 3x3 Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>
          {editor.isActive("table") && (
            <div className="flex items-center gap-0.5 bg-rose-50 border border-rose-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200 rounded"
                title="Add Column"
              >
                +Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-200 rounded"
                title="Add Row"
              >
                +Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                title="Delete Table"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Main Content Area */}
      <EditorContent editor={editor} />

      {/* Image Modal */}
      {showImageModal && (
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-[#6C5CE7]" /> Insert Image
            </h4>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Upload Local File</label>
              <label className="flex items-center justify-center border border-dashed border-slate-300 rounded-xl p-2 bg-white cursor-pointer hover:border-[#6C5CE7]">
                <Upload className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-xs text-slate-600 font-semibold">
                  {uploading ? "Uploading..." : "Choose Image"}
                </span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase">Or Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={insertImageFromUrl}
                  className="bg-[#6C5CE7] text-[#FFFFFF] px-3 py-1.5 rounded-xl text-xs font-bold"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <input
            type="url"
            placeholder="Enter web link URL (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none"
          />
          <button
            type="button"
            onClick={setLink}
            className="bg-[#6C5CE7] text-[#FFFFFF] px-4 py-1.5 rounded-xl text-xs font-bold"
          >
            Save Link
          </button>
          <button
            type="button"
            onClick={() => setShowLinkModal(false)}
            className="text-slate-500 hover:text-slate-700 text-xs px-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
