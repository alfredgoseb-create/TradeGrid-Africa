"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type CustomsDoc = {
  id: string;
  document_type: string;
  reference_number: string;
  description: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  file_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export default function CustomsDocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<CustomsDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<CustomsDoc | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    document_type: "",
    reference_number: "",
    description: "",
    issue_date: "",
    expiry_date: "",
    status: "pending",
    file_url: "",
    notes: "",
  });

  useEffect(() => {
    checkUser();
    fetchDocuments();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) router.push("/login");
  }

  async function fetchDocuments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customs_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert("Failed to fetch documents: " + error.message);
    else setDocs(data || []);
    setLoading(false);
  }

  async function handleFileUpload(file: File): Promise<string | null> {
    const fileName = `customs-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    setUploading(true);
    const { error } = await supabase.storage
      .from("customs-documents")
      .upload(fileName, file);
    setUploading(false);
    if (error) {
      alert("Upload failed: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("customs-documents").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.document_type || !form.reference_number) {
      alert("Document type and reference number are required");
      return;
    }
    const payload = { ...form };
    if (editingDoc) {
      const { error } = await supabase
        .from("customs_documents")
        .update(payload)
        .eq("id", editingDoc.id);
      if (error) alert("Failed to update: " + error.message);
      else {
        setShowForm(false);
        setEditingDoc(null);
        fetchDocuments();
      }
    } else {
      const { error } = await supabase.from("customs_documents").insert([payload]);
      if (error) alert("Failed to create: " + error.message);
      else {
        setShowForm(false);
        resetForm();
        fetchDocuments();
      }
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("customs_documents")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) alert("Failed to update status: " + error.message);
    else fetchDocuments();
  }

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document?")) return;
    const { error } = await supabase.from("customs_documents").delete().eq("id", id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchDocuments();
  }

  function resetForm() {
    setForm({
      document_type: "",
      reference_number: "",
      description: "",
      issue_date: "",
      expiry_date: "",
      status: "pending",
      file_url: "",
      notes: "",
    });
    setEditingDoc(null);
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    expired: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Customs Documents</h1>
            <p className="text-gray-600">
              Manage import/export permits, certificates, and declarations.
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + New Document
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No customs documents yet. Click "New Document" to add one.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.document_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.reference_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[doc.status] || "bg-gray-100"}`}>
                          {doc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {doc.file_url ? (
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingDoc(doc);
                            setForm({
                              document_type: doc.document_type,
                              reference_number: doc.reference_number,
                              description: doc.description || "",
                              issue_date: doc.issue_date?.split("T")[0] || "",
                              expiry_date: doc.expiry_date?.split("T")[0] || "",
                              status: doc.status,
                              file_url: doc.file_url || "",
                              notes: doc.notes || "",
                            });
                            setShowForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <select
                          value={doc.status}
                          onChange={(e) => updateStatus(doc.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm mr-3"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="expired">Expired</option>
                        </select>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingDoc ? "Edit Document" : "New Customs Document"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Document Type *</label>
                  <input
                    type="text"
                    value={form.document_type}
                    onChange={(e) => setForm({ ...form, document_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    placeholder="e.g., Import Permit, Certificate of Origin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reference Number *</label>
                  <input
                    type="text"
                    value={form.reference_number}
                    onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    placeholder="e.g., IMP-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Brief description of goods or purpose"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={form.issue_date}
                      onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiry_date}
                      onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Upload File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file);
                        if (url) setForm({ ...form, file_url: url });
                      }
                    }}
                    className="w-full border rounded px-3 py-2"
                  />
                  {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                  {form.file_url && (
                    <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-1 inline-block">
                      View uploaded file
                    </a>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Internal Notes</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Any internal remarks"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">
                    {editingDoc ? "Save Changes" : "Create Document"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}