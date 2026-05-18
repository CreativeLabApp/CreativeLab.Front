import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import styles from "./TipTapEditor.module.css";

const TipTapEditor = ({ content, onChange, error }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editor,
      },
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

  return (
    <div className={`${styles.container} ${error ? styles.error : ""}`}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${styles.toolbarButton} ${
            editor.isActive("bold") ? styles.active : ""
          }`}
          title="Bold"
        >
          <BoldIcon className={styles.icon} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${styles.toolbarButton} ${
            editor.isActive("italic") ? styles.active : ""
          }`}
          title="Italic"
        >
          <ItalicIcon className={styles.icon} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${styles.toolbarButton} ${
            editor.isActive("strike") ? styles.active : ""
          }`}
          title="Strikethrough"
        >
          <span className={styles.textIcon}>S</span>
        </button>
        <div className={styles.divider} />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${styles.toolbarButton} ${
            editor.isActive("heading", { level: 2 }) ? styles.active : ""
          }`}
          title="Heading"
        >
          <span className={styles.textIcon}>H2</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.toolbarButton} ${
            editor.isActive("bulletList") ? styles.active : ""
          }`}
          title="Bullet List"
        >
          <ListBulletIcon className={styles.icon} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.toolbarButton} ${
            editor.isActive("orderedList") ? styles.active : ""
          }`}
          title="Ordered List"
        >
          <NumberedListIcon className={styles.icon} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.toolbarButton} ${
            editor.isActive("blockquote") ? styles.active : ""
          }`}
          title="Quote"
        >
          <span className={styles.textIcon}>❝</span>
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
};

export default TipTapEditor;
