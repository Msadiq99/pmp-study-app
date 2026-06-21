"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { documents } from "@/lib/api";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<any[]>([]);
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");

  const areas = [
    "Stakeholder Performance", "Team Performance", "Planning and Managing Project Work",
    "Managing Project Changes", "Managing Project Risks", "Engaging Stakeholders",
    "Planning and Managing Schedule", "Planning and Managing Budget", "Managing Project Quality",
    "Managing Scope", "Business Environment", "Promoting Team Performance",
  ];

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    documents.list().then(r => setDocs(r.data)).catch(() => {});
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage("");
    try {
      const res = await documents.upload(file, area || undefined);
      setMessage(`Uploaded ${file.name}: ${res.data.message}`);
      documents.list().then(r => setDocs(r.data));
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.detail || "Upload failed"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Back to Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Upload Study Materials</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Knowledge Area (optional)</label>
          <select value={area} onChange={e => setArea(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Auto-detect</option>
            {areas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50/50 hover:bg-blue-50 transition cursor-pointer"
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium mb-2">Drag & drop your files here</p>
          <p className="text-gray-500 mb-4">or click to browse</p>
          <input type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={handleFileSelect} className="hidden" id="file-input" />
          <label htmlFor="file-input" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block">
            {uploading ? "Processing..." : "Select Files"}
          </label>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${message.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {message}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Uploaded Documents ({docs.length})</h2>
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
                <div>
                  <p className="font-medium">{doc.original_filename}</p>
                  <p className="text-sm text-gray-500">{doc.file_type.toUpperCase()} · {doc.total_pages} pages · {doc.is_processed ? "✅ Processed" : "⏳ Processing..."}</p>
                  {doc.knowledge_area && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{doc.knowledge_area}</span>}
                </div>
                <button onClick={() => documents.delete(doc.id).then(() => documents.list().then(r => setDocs(r.data)))} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
