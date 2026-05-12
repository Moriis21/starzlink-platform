"use client";

import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api";
import { Plus, Trash2, Edit2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const TYPES = ["job", "scholarship", "training", "campus", "resource"];

interface Category { id: string; name: string; type: string; status: string; created_at: string; }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", type: "job" });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAllAdmin();
      setCategories(res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Category name is required"); return; }
    setSaving(true);
    try {
      if (editId) {
        await categoriesApi.update(editId, form);
        toast.success("Category updated!");
        setEditId(null);
      } else {
        await categoriesApi.create(form);
        toast.success("Category created!");
      }
      setForm({ name: "", type: "job" });
      fetchData();
    } catch { toast.error("Failed to save category."); }
    setSaving(false);
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, type: cat.type });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await categoriesApi.delete(id);
      toast.success("Deleted!");
      fetchData();
    } catch { toast.error("Failed."); }
  };

  const handleToggle = async (cat: Category) => {
    try {
      await categoriesApi.update(cat.id, { status: cat.status === "active" ? "inactive" : "active" });
      toast.success("Status updated!");
      fetchData();
    } catch { toast.error("Failed."); }
  };

  const filtered = filter === "all" ? categories : categories.filter(c => c.type === filter);
  const grouped = TYPES.reduce((acc, t) => {
    acc[t] = categories.filter(c => c.type === t);
    return acc;
  }, {} as Record<string, Category[]>);

  const typeColors: Record<string, string> = {
    job: "bg-blue-100 text-blue-700", scholarship: "bg-purple-100 text-purple-700",
    training: "bg-orange-100 text-orange-700", campus: "bg-green-100 text-green-700", resource: "bg-pink-100 text-pink-700",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Categories Management</h1>
        <p className="text-gray-500 text-sm">Manage content categories for jobs, scholarships, trainings, and more.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">{editId ? "Edit Category" : "Add New Category"}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Category Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Engineering"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Type *</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white"
              >
                {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-1.5 bg-[#1a3c8f] text-white font-bold py-3 rounded-xl hover:bg-blue-900 disabled:opacity-60">
              <Plus className="w-4 h-4" /> {saving ? "Saving..." : editId ? "Update Category" : "Add Category"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ name: "", type: "job" }); }} className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                Cancel Edit
              </button>
            )}
          </form>

          {/* Stats */}
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category Counts</p>
            {TYPES.map(t => (
              <div key={t} className="flex items-center justify-between">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", typeColors[t])}>{t}</span>
                <span className="text-sm font-bold text-gray-900">{grouped[t]?.length || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50 flex-wrap gap-3">
            <h2 className="font-bold text-gray-900">All Categories <span className="text-gray-400 font-normal text-sm">({filtered.length})</span></h2>
            <div className="flex gap-2 flex-wrap">
              {["all", ...TYPES].map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors", filter === t ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Tag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No categories found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(cat => (
                <div key={cat.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 group">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", typeColors[cat.type])}>{cat.type}</span>
                    <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    {cat.status === "inactive" && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleToggle(cat)} className={cn("p-1.5 rounded-lg text-xs font-medium px-2", cat.status === "active" ? "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50")}>
                      {cat.status === "active" ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
