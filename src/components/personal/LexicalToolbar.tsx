"use client";

import { useCallback, useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  AlignRight,
} from "lucide-react";

type ToolbarButtonProps = {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  disabled?: boolean;
};

function ToolbarButton({
  active,
  onClick,
  icon,
  title,
  disabled,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-600"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-gray-300 mx-1" />;
}

export default function LexicalToolbar() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Check for link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Check block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode
        );
        setBlockType(parentList ? parentList.getListType() : "paragraph");
      } else {
        setBlockType("paragraph");
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const formatHeading = (headingTag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === headingTag) {
          // Remove heading
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(headingTag));
        }
      }
    });
  };

  const formatBulletList = () => {
    if (blockType === "bullet") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType === "number") {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      setShowLinkInput(true);
    }
  };

  const handleLinkSubmit = () => {
    if (linkUrl) {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  return (
    <div className="border-b border-gray-300 bg-gray-50 p-2">
      <div className="flex flex-wrap items-center gap-1">
        {/* Text formatting */}
        <ToolbarButton
          active={isBold}
          onClick={formatBold}
          icon={<Bold className="w-4 h-4" />}
          title="מודגש (Ctrl+B)"
        />
        <ToolbarButton
          active={isItalic}
          onClick={formatItalic}
          icon={<Italic className="w-4 h-4" />}
          title="נטוי (Ctrl+I)"
        />
        <ToolbarButton
          active={isUnderline}
          onClick={formatUnderline}
          icon={<Underline className="w-4 h-4" />}
          title="קו תחתון (Ctrl+U)"
        />

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          active={blockType === "h2"}
          onClick={() => formatHeading("h2")}
          icon={<Heading2 className="w-4 h-4" />}
          title="כותרת גדולה"
        />
        <ToolbarButton
          active={blockType === "h3"}
          onClick={() => formatHeading("h3")}
          icon={<Heading3 className="w-4 h-4" />}
          title="כותרת קטנה"
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          active={blockType === "bullet"}
          onClick={formatBulletList}
          icon={<List className="w-4 h-4" />}
          title="רשימה עם תבליטים"
        />
        <ToolbarButton
          active={blockType === "number"}
          onClick={formatNumberedList}
          icon={<ListOrdered className="w-4 h-4" />}
          title="רשימה ממוספרת"
        />

        <ToolbarDivider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            active={isLink}
            onClick={insertLink}
            icon={<Link className="w-4 h-4" />}
            title={isLink ? "הסר קישור" : "הוסף קישור"}
          />
          {showLinkInput && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="הזן כתובת URL"
                className="px-2 py-1 border border-gray-300 rounded text-sm w-48"
                dir="ltr"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                  if (e.key === "Escape") {
                    setShowLinkInput(false);
                    setLinkUrl("");
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleLinkSubmit}
                className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                הוסף
              </button>
              <button
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                ביטול
              </button>
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* RTL indicator */}
        <div className="flex items-center gap-1 text-gray-400 text-sm mr-2">
          <AlignRight className="w-4 h-4" />
          <span>RTL</span>
        </div>
      </div>
    </div>
  );
}
