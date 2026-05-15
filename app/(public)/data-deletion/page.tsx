import Link from "next/link";
import { Trash2, Mail, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Data Deletion Request | StarzLink",
  description: "Request deletion of your personal data from StarzLink platform.",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Data Deletion Request</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            You have the right to request deletion of your personal data from StarzLink at any time.
            This page explains what data we hold and how to request its removal.
          </p>
        </div>

        {/* What data we store */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What Data We Store</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Account profile (name, email, phone)",
              "Location details (country, city)",
              "Education and career information",
              "Saved opportunities and bookmarks",
              "Uploaded CVs and analysis history",
              "Generated cover letters",
              "Payment history",
              "Referral activity",
              "Newsletter subscriptions",
              "Activity and login logs",
              "Profile photos",
              "Facebook/Google login connection",
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* How to delete */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">How to Delete Your Data</h2>

          <div className="space-y-4">
            {/* Option 1 - Self service */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-[#1a3c8f] text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                Self-Service (Fastest)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                If you have an account, log in and go to your Account Settings to delete your account and all associated data instantly.
              </p>
              <Link href="/login"
                className="inline-flex items-center gap-2 bg-[#1a3c8f] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-900 transition-colors">
                Log In to Delete Account
              </Link>
            </div>

            {/* Option 2 - Email */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-400 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                Email Request
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Send an email to our data team with your registered email address and we will process your request within 30 days.
              </p>
              <a href="mailto:support@starzlink.com?subject=Data Deletion Request&body=Hello, I would like to request deletion of all my personal data from StarzLink. My registered email is: [your email]"
                className="inline-flex items-center gap-2 text-sm text-[#1a3c8f] font-semibold hover:underline">
                <Mail className="w-4 h-4" /> support@starzlink.com
              </a>
            </div>
          </div>
        </div>

        {/* What gets deleted */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">What Gets Deleted</h2>
          <p className="text-sm text-gray-600 mb-4">
            When your deletion request is processed, the following data is permanently removed from our systems:
          </p>
          <div className="space-y-2">
            {[
              { label: "Account profile and login credentials", done: true },
              { label: "All uploaded CVs and AI analysis results", done: true },
              { label: "Saved opportunities and bookmarks", done: true },
              { label: "Generated cover letters and documents", done: true },
              { label: "Referral history and points", done: true },
              { label: "Payment records (anonymized for legal compliance)", done: false },
              { label: "Newsletter subscription", done: true },
              { label: "Activity logs and login history", done: true },
              { label: "Facebook/Google OAuth connection", done: true },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2 text-sm">
                {item.done ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                )}
                <span className={item.done ? "text-gray-700" : "text-gray-500"}>
                  {item.label}
                  {!item.done && <span className="text-xs text-amber-600 ml-1">(retained for legal compliance)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Processing time */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Processing Time</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Self-service deletions are instant. Email requests are processed within <strong>30 days</strong> in accordance with applicable data protection regulations.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center text-sm text-gray-400">
          <p>Questions? Contact us at{" "}
            <a href="mailto:support@starzlink.com" className="text-[#1a3c8f] hover:underline font-medium">
              support@starzlink.com
            </a>
          </p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="hover:underline">Terms of Use</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
