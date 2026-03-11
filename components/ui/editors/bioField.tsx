"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import HardBreak from "@tiptap/extension-hard-break";
import { useEffect, useState } from "react";

const MAX_CHARS = 200; // 🔹 letters limit
const MAX_LINES = 5;

export default function BioEditor({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (message: string) => void;
}) {
  const [chars, setChars] = useState(0);
  const [lines, setLines] = useState(1);

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,
     
      HardBreak.configure({
        HTMLAttributes: {
          class: "block",
        },
      }),

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

    editorProps: {
      handleKeyDown(view, event) {
        // Enter inserts single line break
        if (event.key === "Enter") {
          event.preventDefault();
          view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.hardBreak.create()));
          return true;
        }
        return false;
      },
    },

    onUpdate: ({ editor }) => {
      const text = editor.getText();

      const charCount = text.length;
      const lineCount = text.split("\n").length;

      // 🚫 enforce limits
      if (charCount > MAX_CHARS || lineCount > MAX_LINES) {
        editor.commands.undo();
        return;
      }

      setChars(charCount);
      setLines(lineCount);

      setMessage(editor.getHTML());
    },
  });

  // 🔁 sync on Cancel/reset
  useEffect(() => {
    if (editor && message !== editor.getHTML()) {
      editor.commands.setContent(message || "");
    }
  }, [message, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2">

      <EditorContent
        editor={editor}
        className="min-h-[100px] max-h-[120px] overflow-y-auto whitespace-pre-wrap"
      />

      {/* Counter */}
      <div
        className={`text-xs text-right ${
          chars >= MAX_CHARS || lines >= MAX_LINES
            ? "text-red-500"
            : "text-muted-foreground"
        }`}
      >
        {chars}/{MAX_CHARS} characters • {lines}/{MAX_LINES} lines
      </div>
    </div>
  );
}