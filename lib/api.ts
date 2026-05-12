/**
 * InsForge-backed API helpers for StarzLink.
 * All functions return { data, error } matching InsForge SDK conventions.
 */
import { insforge } from "./insforge";

// ── helpers ────────────────────────────────────────────────────────────────

function paginate(page: number | string = 1, limit: number | string = 12) {
  const p = Number(page);
  const l = Number(limit);
  const from = (p - 1) * l;
  return { from, to: from + l - 1, p, l };
}

export interface ListParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  sort?: string;
  [key: string]: any;
}

const toNum = (v: number | string | undefined, fallback: number) =>
  v === undefined ? fallback : Number(v);

// ── Auth ───────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  user_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: ({ full_name, email, phone, password, user_type }: RegisterPayload) =>
    insforge.auth.signUp({ email, password, name: full_name }),

  login: ({ email, password }: LoginPayload) =>
    insforge.auth.signInWithPassword({ email, password }),

  logout: () => insforge.auth.signOut(),

  forgotPassword: (email: string) =>
    insforge.auth.sendResetPasswordEmail({ email }),

  getCurrentUser: () => insforge.auth.getCurrentUser(),
};

// ── Jobs ───────────────────────────────────────────────────────────────────

export const jobsApi = {
  getAll: async (params: ListParams = {}) => {
    const { search, status, sort } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 12);

    let q = insforge.database
      .from("jobs")
      .select("*", { count: "exact" });

    if (status) q = status === "active" ? q.in("status", ["active", "published"]) : q.eq("status", status);
    if (search) q = q.ilike("title", `%${search}%`);
    if (params.category) q = q.eq("category", params.category);
    if (params.location) q = q.ilike("location", `%${params.location}%`);
    if (params.job_type) q = q.eq("job_type", params.job_type);

    q = q.order(sort === "deadline" ? "deadline" : "created_at", { ascending: false });
    q = q.range(from, to);

    const { data, error, count } = await q;
    return {
      data: { data: data ?? [], total: count ?? 0, page: p, per_page: l, total_pages: Math.ceil((count ?? 0) / l) },
      error
    };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database
      .from("jobs").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  create: async (payload: any) => {
    const { data, error } = await insforge.database
      .from("jobs").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  update: async (id: string, payload: any) => {
    const { data, error } = await insforge.database
      .from("jobs").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => {
    const { data, error } = await insforge.database.from("jobs").delete().eq("id", id);
    return { data, error };
  },

  toggleStatus: async (id: string) => {
    const { data: existing } = await insforge.database.from("jobs").select("status").eq("id", id).single();
    const newStatus = existing?.status === "active" ? "expired" : "active";
    return insforge.database.from("jobs").update({ status: newStatus }).eq("id", id).select();
  },
};

// ── Scholarships ───────────────────────────────────────────────────────────

export const scholarshipsApi = {
  getAll: async (params: ListParams = {}) => {
    const { search, status } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 12);

    let q = insforge.database.from("scholarships").select("*", { count: "exact" });
    if (status) q = q.eq("status", status);
    if (search) q = q.ilike("title", `%${search}%`);
    if (params.study_level) q = q.eq("study_level", params.study_level);
    if (params.country) q = q.eq("country", params.country);
    if (params.funding_type) q = q.ilike("funding_type", `%${params.funding_type}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0, page: p, total_pages: Math.ceil((count ?? 0) / l) }, error };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database.from("scholarships").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  create: async (payload: any) => {
    const { data, error } = await insforge.database.from("scholarships").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  update: async (id: string, payload: any) => {
    const { data, error } = await insforge.database.from("scholarships").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("scholarships").delete().eq("id", id),

  toggleStatus: async (id: string) => {
    const { data: ex } = await insforge.database.from("scholarships").select("status").eq("id", id).single();
    return insforge.database.from("scholarships").update({ status: ex?.status === "active" ? "expired" : "active" }).eq("id", id).select();
  },
};

// ── Trainings ──────────────────────────────────────────────────────────────

export const trainingsApi = {
  getAll: async (params: ListParams = {}) => {
    const { search, status } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 12);

    let q = insforge.database.from("trainings").select("*", { count: "exact" });
    if (status) q = q.eq("status", status);
    if (search) q = q.ilike("title", `%${search}%`);
    if (params.category) q = q.eq("category", params.category);
    if (params.level) q = q.eq("level", params.level);
    if (params.mode) q = q.ilike("mode", `%${params.mode}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0, page: p, total_pages: Math.ceil((count ?? 0) / l) }, error };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database.from("trainings").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  create: async (payload: any) => {
    const { data, error } = await insforge.database.from("trainings").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  update: async (id: string, payload: any) => {
    const { data, error } = await insforge.database.from("trainings").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("trainings").delete().eq("id", id),

  toggleStatus: async (id: string) => {
    const { data: ex } = await insforge.database.from("trainings").select("status").eq("id", id).single();
    return insforge.database.from("trainings").update({ status: ex?.status === "active" ? "expired" : "active" }).eq("id", id).select();
  },
};

// ── Campus Updates ─────────────────────────────────────────────────────────

export const campusApi = {
  getAll: async (params: ListParams = {}) => {
    const { search } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 12);

    let q = insforge.database.from("campus_updates").select("*", { count: "exact" });
    if (params.category && params.category !== "all") q = q.eq("category", params.category);
    if (search) q = q.ilike("title", `%${search}%`);
    if (params.institution) q = q.ilike("institution", `%${params.institution}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0, page: p, total_pages: Math.ceil((count ?? 0) / l) }, error };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database.from("campus_updates").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  create: async (payload: any) => {
    const { data, error } = await insforge.database.from("campus_updates").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  update: async (id: string, payload: any) => {
    const { data, error } = await insforge.database.from("campus_updates").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("campus_updates").delete().eq("id", id),
};

// ── Resources ──────────────────────────────────────────────────────────────

export const resourcesApi = {
  getAll: async (params: ListParams = {}) => {
    const { search, status } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 12);

    let q = insforge.database.from("resources").select("*", { count: "exact" });
    if (status) q = q.eq("status", status);
    if (search) q = q.ilike("title", `%${search}%`);
    if (params.category) q = q.eq("category", params.category);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0, page: p, total_pages: Math.ceil((count ?? 0) / l) }, error };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database.from("resources").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  create: async (payload: any) => {
    // Ensure access_url is stored
    const row = { ...payload };
    if (!row.file_url && row.access_url) row.file_url = row.access_url;
    const { data, error } = await insforge.database.from("resources").insert([row]).select();
    return { data: { data: data?.[0] }, error };
  },

  update: async (id: string, payload: any) => {
    const row = { ...payload };
    if (!row.file_url && row.access_url) row.file_url = row.access_url;
    const { data, error } = await insforge.database.from("resources").update(row).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("resources").delete().eq("id", id),
};

// ── Users (Admin) ──────────────────────────────────────────────────────────

export const usersApi = {
  getAll: async (params: ListParams = {}) => {
    const { search } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 15);

    let q = insforge.database.from("profiles").select("*", { count: "exact" });
    if (search) q = q.ilike("full_name", `%${search}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0, page: p, total_pages: Math.ceil((count ?? 0) / l) }, error };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database.from("profiles").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  update: async (id: string, payload: any) => {
    const { data, error } = await insforge.database.from("profiles").update(payload).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("profiles").delete().eq("id", id),

  updateRole: async (id: string, role: string) => {
    const { data, error } = await insforge.database.from("profiles").update({ role }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },
};

// ── Messages ───────────────────────────────────────────────────────────────

export const messagesApi = {
  getAll: async (params: ListParams = {}) => {
    const { search } = params;
    const { from, to, p, l } = paginate(params.page, params.limit ?? 20);

    let q = insforge.database.from("messages").select("*", { count: "exact" });
    if (search) q = q.ilike("subject", `%${search}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0, page: p, total_pages: Math.ceil((count ?? 0) / l) }, error };
  },

  getOne: async (id: string) => {
    const { data, error } = await insforge.database.from("messages").select("*").eq("id", id).single();
    return { data: { data }, error };
  },

  send: async (payload: any) => {
    const { data, error } = await insforge.database.from("messages").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  updateStatus: async (id: string, status: string) => {
    const { data, error } = await insforge.database.from("messages").update({ status }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("messages").delete().eq("id", id),
};

// ── Newsletter ─────────────────────────────────────────────────────────────

export const newsletterApi = {
  subscribe: async (email: string) => {
    const { data, error } = await insforge.database
      .from("newsletter_subscribers")
      .insert([{ email }])
      .select();
    return { data: { data: data?.[0] }, error };
  },

  unsubscribe: async (email: string) => {
    const { data, error } = await insforge.database
      .from("newsletter_subscribers").delete().eq("email", email);
    return { data, error };
  },

  getSubscribers: async (params: ListParams = {}) => {
    const { search } = params;
    const { from, to } = paginate(params.page, params.limit ?? 50);

    let q = insforge.database.from("newsletter_subscribers").select("*", { count: "exact" });
    if (search) q = q.ilike("email", `%${search}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0 }, error };
  },

  // Newsletter sending would be handled via an edge function
  sendNewsletter: async (payload: { subject: string; body: string }) => {
    const { data, error } = await insforge.functions.invoke("send-newsletter", { body: payload });
    return { data, error };
  },
};

// ── Saved Items ────────────────────────────────────────────────────────────

export const savedApi = {
  getAll: async () => {
    const { data, error } = await insforge.database
      .from("saved_items").select("*").order("created_at", { ascending: false });
    return { data: { data: data ?? [] }, error };
  },

  save: async (item_type: string, item_id: string) => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const user = authData?.user;
    if (!user?.id) return { data: null, error: new Error("Not authenticated") };

    const { data, error } = await insforge.database
      .from("saved_items").insert([{ user_id: user.id, item_type, item_id }]).select();
    return { data: { data: data?.[0] }, error };
  },

  remove: async (id: string) => insforge.database.from("saved_items").delete().eq("id", id),
};

// ── Submissions ────────────────────────────────────────────────────────────

export const submissionsApi = {
  getAll: async (params: ListParams = {}) => {
    const { search } = params;
    const { from, to } = paginate(params.page, params.limit ?? 20);

    let q = insforge.database.from("submissions").select("*", { count: "exact" });
    if (params.status) q = q.eq("status", params.status);
    if (search) q = q.ilike("title", `%${search}%`);
    q = q.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await q;
    return { data: { data: data ?? [], total: count ?? 0 }, error };
  },

  create: async (payload: any) => {
    const { data, error } = await insforge.database.from("submissions").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  approve: async (id: string) => {
    const { data, error } = await insforge.database.from("submissions").update({ status: "approved" }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  reject: async (id: string, admin_note: string) => {
    const { data, error } = await insforge.database.from("submissions").update({ status: "rejected", admin_note }).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },
};

// ── Admin / Stats ──────────────────────────────────────────────────────────

export const adminApi = {
  getStats: async () => {
    const [jobs, scholarships, trainings, campusUpdates, users, messages, newsletter, submissions] =
      await Promise.all([
        insforge.database.from("jobs").select("id", { count: "exact" }).limit(1),
        insforge.database.from("scholarships").select("id", { count: "exact" }).limit(1),
        insforge.database.from("trainings").select("id", { count: "exact" }).limit(1),
        insforge.database.from("campus_updates").select("id", { count: "exact" }).limit(1),
        insforge.database.from("profiles").select("id", { count: "exact" }).limit(1),
        insforge.database.from("messages").select("id", { count: "exact" }).eq("status", "unread").limit(1),
        insforge.database.from("newsletter_subscribers").select("id", { count: "exact" }).limit(1),
        insforge.database.from("submissions").select("id", { count: "exact" }).eq("status", "pending").limit(1),
      ]);

    return {
      data: {
        data: {
          total_jobs: jobs.count ?? 0,
          total_scholarships: scholarships.count ?? 0,
          total_trainings: trainings.count ?? 0,
          total_campus_updates: campusUpdates.count ?? 0,
          total_users: users.count ?? 0,
          unread_messages: messages.count ?? 0,
          newsletter_subscribers: newsletter.count ?? 0,
          pending_submissions: submissions.count ?? 0,
        }
      },
      error: null
    };
  },

  getActivityLogs: async (params: ListParams = {}) => {
    const { from, to } = paginate(params.page, params.limit ?? 20);

    const p2 = Number(params.page ?? 1), l2 = 20;
    const { data, error, count } = await insforge.database
      .from("activity_logs").select("*", { count: "exact" })
      .order("created_at", { ascending: false }).range(from, to);
    return { data: { data: data ?? [], total: count ?? 0, total_pages: Math.ceil((count ?? 0) / l2) }, error };
  },

  logAction: async (action: string, module: string, details?: string) => {
    const { data: authData } = await insforge.auth.getCurrentUser();
    const user = authData?.user;
    return insforge.database.from("activity_logs").insert([{
      user_id: user?.id ?? null, action, module, details
    }]);
  },

  /**
   * Trigger auto-notification to all registered users + newsletter subscribers
   * Call this after publishing any new job/scholarship/training/resource/campus update
   */
  sendAutoNotification: async (payload: {
    type: "job" | "scholarship" | "training" | "resource" | "campus";
    title: string;
    description: string;
    organization: string;
    deadline?: string;
    link: string;
  }) => {
    try {
      const { data, error } = await insforge.functions.invoke("auto-notify", { body: payload });
      return { data, error };
    } catch (e: any) {
      return { data: null, error: e };
    }
  },

  exportCSV: async (type: string) => {
    // Fetch all rows for export (no pagination)
    const tableMap: Record<string, string> = {
      jobs: "jobs", scholarships: "scholarships", trainings: "trainings",
      "campus-updates": "campus_updates", users: "profiles", messages: "messages",
    };
    const table = tableMap[type] ?? type;
    const { data, error } = await insforge.database.from(table).select("*").order("created_at", { ascending: false });
    return { data, error };
  },
};

// ── Settings ───────────────────────────────────────────────────────────────

export const settingsApi = {
  getAll: async () => {
    const { data, error } = await insforge.database.from("settings").select("*");
    // Convert array to key-value object
    const settings: Record<string, string> = {};
    (data ?? []).forEach((row: any) => { settings[row.key] = row.value; });
    return { data: { data: settings }, error };
  },

  update: async (key: string, value: string) => {
    const { data, error } = await insforge.database
      .from("settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key)
      .select();
    return { data: { data: data?.[0] }, error };
  },
};

// ── Categories ─────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: async (type?: string) => {
    let q = insforge.database.from("categories").select("*").eq("status", "active").order("name");
    if (type) q = q.eq("type", type);
    const { data, error } = await q;
    return { data: { data: data ?? [] }, error };
  },

  getAllAdmin: async () => {
    const { data, error } = await insforge.database.from("categories").select("*").order("type").order("name");
    return { data: { data: data ?? [] }, error };
  },

  create: async (payload: { name: string; type: string }) => {
    const { data, error } = await insforge.database.from("categories").insert([payload]).select();
    return { data: { data: data?.[0] }, error };
  },

  update: async (id: string, payload: object) => {
    const { data, error } = await insforge.database.from("categories").update(payload).eq("id", id).select();
    return { data: { data: data?.[0] }, error };
  },

  delete: async (id: string) => insforge.database.from("categories").delete().eq("id", id),
};

// ── Storage ────────────────────────────────────────────────────────────────

export const storageApi = {
  uploadImage: async (file: File, folder = "general") => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await insforge.storage.from("images").upload(path, file);
    return { data, error, url: data?.url ?? null };
  },

  uploadDocument: async (file: File) => {
    const path = `docs/${Date.now()}-${file.name}`;
    const { data, error } = await insforge.storage.from("documents").upload(path, file);
    return { data, error, url: data?.url ?? null };
  },

  uploadAvatar: async (file: File, userId: string) => {
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { data, error } = await insforge.storage.from("avatars").upload(path, file);
    return { data, error, url: data?.url ?? null };
  },
};
