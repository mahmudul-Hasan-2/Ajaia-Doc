"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Save,
  Share2,
  Upload,
  ArrowLeft,
  Check,
  FileText,
  UserPlus,
} from "lucide-react";

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [doc, setDoc] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sharing & New User States
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  // New User Quick Add States
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [addingUser, setAddingUser] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("ajaia_user");
    if (!storedUser) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDocument(parsedUser.id);
    fetchUsers(parsedUser.id);
  }, [id, router]);

  async function fetchDocument(currentUserId: string) {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Document not found!");
      router.push("/dashboard");
      return;
    }

    setDoc(data);
    setTitle(data.title);
    if (editor && data.content) {
      editor.commands.setContent(data.content);
    }
  }

  useEffect(() => {
    if (editor && doc && editor.isEmpty && doc.content) {
      editor.commands.setContent(doc.content);
    }
  }, [editor, doc]);

  async function fetchUsers(currentUserId: string) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .neq("id", currentUserId);
    if (data) {
      setAllUsers(data);
      if (data.length > 0) setSelectedUserId(data[0].id);
    }
  }

  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    const htmlContent = editor.getHTML();

    const { error } = await supabase
      .from("documents")
      .update({
        title: title.trim() || "Untitled Document",
        content: htmlContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);
    if (!error) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } else {
      alert("Failed to save document.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      alert("Only .txt and .md files are supported!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const formattedHtml = text
        .split("\n")
        .map((line) => `<p>${line}</p>`)
        .join("");

      editor?.commands.setContent(formattedHtml);
      if (title === "Untitled Document") {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsText(file);
  };

  const handleShare = async () => {
    if (!selectedUserId) return;
    const { error } = await supabase
      .from("document_shares")
      .insert([{ document_id: id, shared_with_user_id: selectedUserId }]);

    if (error) {
      setShareMessage("Already shared or error occurred.");
    } else {
      setShareMessage("Document shared successfully!");
    }
    setTimeout(() => setShareMessage(""), 3000);
  };

  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setAddingUser(true);
    const { data, error } = await supabase
      .from("users")
      .insert([
        { name: newUserName.trim(), email: newUserEmail.trim().toLowerCase() },
      ])
      .select()
      .single();

    setAddingUser(false);
    if (error) {
      alert("Error adding user (Email might already exist).");
    } else if (data) {
      setAllUsers([...allUsers, data]);
      setSelectedUserId(data.id);
      setNewUserName("");
      setNewUserEmail("");
      alert("New user created and selected for sharing!");
    }
  };

  if (!doc || !user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-gray-400 text-sm">
        Loading workspace...
      </div>
    );

  const isOwner = doc.owner_id === user.id;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
        .ProseMirror:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all focus:outline-none focus:ring-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-0 px-1 py-0.5 transition-all w-64"
              placeholder="Document Title"
            />
          </div>
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 tracking-wide uppercase">
            {isOwner ? "Owner" : "Shared Workspace"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl cursor-pointer transition-all shadow-2xs">
            <Upload size={14} className="text-gray-500" />
            <span>Import (.txt/.md)</span>
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-0"
          >
            {savedSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>
              {saving ? "Saving..." : savedSuccess ? "Saved!" : "Save changes"}
            </span>
          </button>
        </div>
      </header>

      {/* Share Bar & New User Creator */}
      {isOwner && (
        <div className="max-w-4xl mx-auto mt-4 px-4 space-y-3">
          <div className="bg-white p-3.5 rounded-2xl shadow-2xs border border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <Share2 size={15} className="text-blue-600" />
              <span className="font-medium text-gray-700">Share with:</span>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs bg-gray-50 text-gray-800 focus:outline-none focus:ring-0 focus:border-blue-600 transition-all"
              >
                {allUsers.length === 0 ? (
                  <option value="">No other users found</option>
                ) : (
                  allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))
                )}
              </select>
              <button
                onClick={handleShare}
                disabled={allUsers.length === 0}
                className="bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-50 focus:outline-none focus:ring-0"
              >
                Grant Access
              </button>
            </div>
            {shareMessage && (
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {shareMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Editor Container with e.preventDefault() on Toolbar Buttons */}
      <main className="max-w-4xl mx-auto mt-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {editor && (
            <div className="border-b border-gray-200 bg-[#f8f9fa] px-4 py-2.5 flex flex-wrap gap-1 items-center sticky top-[61px] z-20">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("bold") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("italic") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("underline") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Underline"
              >
                <UnderlineIcon size={16} />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1.5" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("heading", { level: 1 }) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Heading 1"
              >
                <Heading1 size={16} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("heading", { level: 2 }) ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Heading 2"
              >
                <Heading2 size={16} />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1.5" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"}`}
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
            </div>
          )}

          <div className="p-12 sm:p-20 text-gray-800 min-h-[750px] font-sans leading-relaxed text-[16px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>
    </div>
  );
}
