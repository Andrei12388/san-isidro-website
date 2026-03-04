"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import Placeholder from "@tiptap/extension-placeholder";

export default function MessageEditor({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (message: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false, // ⭐ FIX FOR SSR

    extensions: [
      StarterKit,
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder: "Message...",
      }),
    ],

    content: message,

    onUpdate: ({ editor }) => {
      setMessage(editor.getHTML());
    },
  });

  useEffect(() => {
  if (editor && message !== editor.getHTML()) {
    editor.commands.setContent(message || "");
  }
}, [message, editor]);

  if (!editor) return null;

  return (
    <div className="border border-muted-foreground rounded min-h-[200px]">
      <EditorContent editor={editor} />
    </div>
  );
}
