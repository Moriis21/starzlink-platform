"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const insforgeStatus = searchParams.get("insforge_status");
        const insforgeType = searchParams.get("insforge_type");
        const insforgeError = searchParams.get("insforge_error");

        // Handle email verification callback
        if (insforgeType === "verify_email") {
          if (insforgeStatus === "success") {
            setStatus("success");
            setMessage("Email verified! Redirecting to login…");
            setTimeout(() => router.push("/login"), 2000);
          } else {
            setStatus("error");
            setMessage(insforgeError || "Email verification failed.");
          }
          return;
        }

        // Handle OAuth callback — SDK auto-handles the insforge_code exchange
        const { data, error } = await insforge.auth.getCurrentUser();
        if (error || !data?.user) {
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          return;
        }

        // Ensure profile exists with correct role
        await insforge.database.from("profiles").upsert([{
          id: data.user.id,
          full_name: data.user.profile?.name ?? data.user.email,
        }], { onConflict: "id" });

        setStatus("success");
        setMessage("Sign-in successful! Redirecting…");
        setTimeout(() => router.push("/dashboard"), 1500);

      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Something went wrong.");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-sm w-full mx-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-[#1a3c8f] animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Please wait</h2>
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Success!</h2>
            <p className="text-sm text-gray-500">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Sign-in Failed</h2>
            <p className="text-sm text-gray-500 mb-4">{message}</p>
            <button onClick={() => router.push("/login")} className="bg-[#1a3c8f] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-900 text-sm">
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3c8f]" /></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
