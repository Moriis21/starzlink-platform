"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jobsApi, adminApi } from "@/lib/api";
import { Job } from "@/types";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate, getStatusColor, cn } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" };
      if (search) params.search = search;
      const res = await jobsApi.getAll(params);
      const data = res.data;
      setJobs(data?.data || data || []);
      setTotalPages(data?.total_pages || 1);
      setTotal(data?.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await jobsApi.delete(id);
      toast.success("Job deleted successfully.");
      fetchJobs();
    } catch { toast.error("Failed to delete."); }
  };

  const handleToggle = async (id: string) => {
    try {
      await jobsApi.toggleStatus(id);
      toast.success("Status updated.");
      fetchJobs();
    } catch { toast.error("Failed to update status."); }
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.exportCSV("jobs");
      if (!res.data) return;
      // Convert to CSV
      const headers = Object.keys(res.data[0] ?? {}).join(",");
      const rows = (res.data as any[]).map(r => Object.values(r).map(v => `"${v}"`).join(","));
      const csv = [headers, ...rows].join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "jobs.csv";
      a.click();
    } catch { toast.error("Export failed."); }
  };

  const columns = [
    {
      key: "title", label: "Job Title",
      render: (job: Job) => (
        <div>
          <p className="font-semibold text-gray-900">{job.title}</p>
          <p className="text-xs text-gray-500">{job.company}</p>
        </div>
      )
    },
    { key: "category", label: "Category" },
    { key: "location", label: "Location" },
    {
      key: "job_type", label: "Type",
      render: (job: Job) => <span className="capitalize text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{job.job_type}</span>
    },
    {
      key: "deadline", label: "Deadline",
      render: (job: Job) => <span className="text-xs">{formatDate(job.deadline)}</span>
    },
    {
      key: "status", label: "Status",
      render: (job: Job) => (
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full capitalize", getStatusColor(job.status))}>{job.status}</span>
      )
    },
    {
      key: "created_at", label: "Posted On",
      render: (job: Job) => <span className="text-xs text-gray-500">{formatDate(job.created_at)}</span>
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Jobs Management</h1>
          <p className="text-gray-500 text-sm">Manage all job opportunities on StarzLink.</p>
        </div>
      </div>

      <AdminTable
        title="Job Opportunities"
        addHref="/admin/jobs/new"
        columns={columns as any}
        data={jobs}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onDelete={handleDelete}
        onEdit={(id) => router.push(`/admin/jobs/${id}/edit`)}
        onToggle={handleToggle}
        onExport={handleExport}
        total={total}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
