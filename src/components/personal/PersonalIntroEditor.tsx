"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes, EditorState, LexicalEditor } from "lexical";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { uploadImage } from "@/lib/utils/imageUpload";
import { useToastActions } from "@/components/ui/Toast";
import LexicalToolbar from "./LexicalToolbar";

// Lexical theme configuration
const theme = {
  root: "lexical-root",
  paragraph: "mb-2 text-right",
  heading: {
    h2: "text-xl font-bold mb-3 text-right",
    h3: "text-lg font-semibold mb-2 text-right",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    ul: "list-disc mr-6 mb-2",
    ol: "list-decimal mr-6 mb-2",
    listitem: "mb-1",
  },
  link: "text-blue-600 hover:underline cursor-pointer",
};

interface PersonalIntroEditorProps {
  initialHtml?: string;
  bannerUrl?: string;
  storagePath: string;
  onSave: (data: { html: string; bannerUrl?: string }) => Promise<void>;
  saveButtonText?: string;
}

// Plugin to initialize editor with HTML content
function InitializePlugin({ initialHtml }: { initialHtml?: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  if (!initialized.current && initialHtml) {
    initialized.current = true;
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      $insertNodes(nodes);
    });
  }

  return null;
}

export default function PersonalIntroEditor({
  initialHtml = "",
  bannerUrl: initialBannerUrl,
  storagePath,
  onSave,
  saveButtonText = "שמור",
}: PersonalIntroEditorProps) {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<LexicalEditor | null>(null);
  const toast = useToastActions();

  const initialConfig = {
    namespace: "PersonalIntroEditor",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  const onChange = useCallback((state: EditorState, editor: LexicalEditor) => {
    setEditorState(state);
    editorRef.current = editor;
  }, []);

  const handleBannerSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("יש לבחור קובץ תמונה");
        return;
      }

      // Revoke previous preview URL if exists
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }

      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    },
    [toast, bannerPreview]
  );

  const handleRemoveBanner = useCallback(() => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    setBannerFile(null);
    setBannerUrl(undefined);
  }, [bannerPreview]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;

    setIsSaving(true);
    try {
      // Generate HTML from editor (read is synchronous)
      let html = "";
      editorRef.current.read(() => {
        html = $generateHtmlFromNodes(editorRef.current!);
      });

      // Upload banner if changed
      let finalBannerUrl = bannerUrl;
      if (bannerFile) {
        setIsUploading(true);
        const timestamp = Date.now();
        const path = `${storagePath}/banner-${timestamp}.webp`;
        finalBannerUrl = await uploadImage(bannerFile, path);
        setIsUploading(false);
        setBannerUrl(finalBannerUrl);
        if (bannerPreview) {
          URL.revokeObjectURL(bannerPreview);
        }
        setBannerPreview(null);
        setBannerFile(null);
      }

      await onSave({ html, bannerUrl: finalBannerUrl });
      toast.success("נשמר בהצלחה");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("שגיאה בשמירה");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  }, [bannerUrl, bannerFile, bannerPreview, storagePath, onSave, toast]);

  // Cleanup banner preview URL on unmount
  useEffect(() => {
    return () => {
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  const currentBannerDisplay = bannerPreview || bannerUrl;

  return (
    <div className="space-y-4">
      {/* Banner Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          תמונת באנר (אופציונלי)
        </label>
        {currentBannerDisplay ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img
              src={currentBannerDisplay}
              alt="באנר"
              className="w-full h-40 object-cover"
            />
            <button
              onClick={handleRemoveBanner}
              className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="הסר באנר"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">לחץ להעלאת תמונת באנר</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Rich Text Editor */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          תוכן ההקדמה
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <LexicalComposer initialConfig={initialConfig}>
            <LexicalToolbar />
            <div className="relative min-h-[200px] p-4 bg-white">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="outline-none min-h-[180px] text-right"
                    dir="rtl"
                  />
                }
                placeholder={
                  <div className="absolute top-4 right-4 text-gray-400 pointer-events-none">
                    הזן את תוכן ההקדמה כאן...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              <OnChangePlugin onChange={onChange} />
              <HistoryPlugin />
              <ListPlugin />
              <LinkPlugin />
              <InitializePlugin initialHtml={initialHtml} />
            </div>
          </LexicalComposer>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          leftIcon={isSaving || isUploading ? Loader2 : Upload}
          className={isSaving || isUploading ? "animate-pulse" : ""}
        >
          {isUploading ? "מעלה תמונה..." : isSaving ? "שומר..." : saveButtonText}
        </Button>
      </div>
    </div>
  );
}
