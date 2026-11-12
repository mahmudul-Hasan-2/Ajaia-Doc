"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus, FileText, Share2, LogOut, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [ownedDocs, setOwnedDocs] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("ajaia_user");
    if (!storedUser) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDocuments(parsedUser.id);
  }, [router]);

  async function fetchDocuments(userId: string) {
    setLoading(true);
    try {
      // ১. নিজস্ব ডকুমেন্ট ফেচ করা
      const { data: owned } = await supabase
        .from("documents")
        .select("*")
        .eq("owner_id", userId)
        .order("updated_at", { ascending: false });
      if (owned) setOwnedDocs(owned);

      // ২. শেয়ার করা ডকুমেন্ট ফেচ করা
      const { data: shares } = await supabase
        .from("document_shares")
        .select("document_id, documents(*)")
        .eq("shared_with_user_id", userId);

      if (shares) {
        const shared = shares.map((s: any) => s.documents).filter(Boolean);
        setSharedDocs(shared);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  }

  const createNewDocument = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("documents")
      .insert([{ title: "Untitled Document", content: "", owner_id: user.id }])
      .select()
      .single();

    if (data) {
      router.push(`/documents/${data.id}`);
    } else {
      alert("Failed to create document.");
    }
  };

  const deleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation(); // যাতে কার্ডে ক্লিক হয়ে এডিটর পেজে না চলে যায়
    if (!confirm("Are you sure you want to delete this document?")) return;

    const { error } = await supabase.from("documents").delete().eq("id", docId);
    if (!error) {
      setOwnedDocs(ownedDocs.filter((d) => d.id !== docId));
    } else {
      alert("Failed to delete document.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ajaia_user");
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Your Documents
          </h2>
          <button
            onClick={createNewDocument}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            <Plus size={16} /> New Document
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading documents...</p>
        ) : (
          <>
            {/* Owned Docs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {ownedDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer transition flex items-start justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="text-blue-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Updated: {new Date(doc.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteDocument(e, doc.id)}
                    className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition"
                    title="Delete Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {ownedDocs.length === 0 && (
                <p className="text-sm text-gray-500 col-span-2">
                  No documents found. Create your first document above!
                </p>
              )}
            </div>

            {/* Shared With Me Section */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Shared With Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md cursor-pointer transition flex items-start gap-3"
                >
                  <Share2 className="text-purple-600 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                    <p className="text-xs text-purple-600 mt-1 font-medium">
                      Shared Document
                    </p>
                  </div>
                </div>
              ))}
              {sharedDocs.length === 0 && (
                <p className="text-sm text-gray-500 col-span-2">
                  No shared documents available.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
