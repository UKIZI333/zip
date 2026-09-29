"use client";

import { useState, useRef, useEffect } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Briefcase } from "lucide-react";

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id?: string;
    title: string;
    slug?: string;
    department?: string;
    location?: string;
    compensation?: string;
  };
}

export default function ApplyModal({ isOpen, onClose, job }: ApplyModalProps) {
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [email, setEmail]               = useState("");
  const [linkedinUrl, setLinkedinUrl]   = useState("");
  const [coverNote, setCoverNote]       = useState("");
  const [resumeFile, setResumeFile]     = useState<File | null>(null);
  const [resumeFilename, setResumeFilename] = useState("");
  const [resumeFileData, setResumeFileData] = useState("");
  const [isDragging, setIsDragging]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setIsSuccess(false); setErrorMessage(""); }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleFileChange = (file: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setErrorMessage("Please upload a PDF or Word document.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File must be under 10 MB.");
      return;
    }
    setErrorMessage("");
    setResumeFile(file);
    setResumeFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setResumeFileData(result.split(",")[1] ?? "");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setErrorMessage("Please fill in your name and email.");
      return;
    }
    if (!resumeFile) {
      setErrorMessage("Please attach your CV / resume.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId:        job.id,
          jobTitle:     job.title,
          jobSlug:      job.slug,
          firstName,
          lastName,
          email,
          linkedinUrl,
          coverNote,
          resumeFilename,
          resumeFileData,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Submission failed. Please try again.");
      }
      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-paper rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-paper border-b rule-hairline px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brass/10 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5 text-brass" />
            </div>
            <div>
              <h2 className="font-bold text-nfdark text-base leading-tight">Apply for this Role</h2>
              <p className="text-xs text-muted">{job.title}{job.department ? ` · ${job.department}` : ""}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-paperdim transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success state */}
        {isSuccess ? (
          <div className="px-6 py-16 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-brass mx-auto" />
            <h3 className="font-bold text-nfdark text-xl">Application Submitted!</h3>
            <p className="text-muted text-sm max-w-xs mx-auto">
              Thank you, {firstName}. We'll review your application and be in touch within 48 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-nfdark hover:bg-nfdark/90 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-nfdark">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                  className="w-full border rule-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brass transition-colors bg-paper"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-nfdark">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  required
                  className="w-full border rule-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brass transition-colors bg-paper"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nfdark">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                className="w-full border rule-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brass transition-colors bg-paper"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nfdark">LinkedIn Profile <span className="text-muted font-normal">(optional)</span></label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full border rule-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brass transition-colors bg-paper"
              />
            </div>

            {/* CV Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nfdark">CV / Resume *</label>
              {resumeFile ? (
                <div className="flex items-center gap-3 border rule-hairline rounded-lg px-4 py-3 bg-brass/5">
                  <FileText className="w-5 h-5 text-brass shrink-0" />
                  <span className="text-sm text-nfdark font-medium flex-1 truncate">{resumeFilename}</span>
                  <button
                    type="button"
                    onClick={() => { setResumeFile(null); setResumeFilename(""); setResumeFileData(""); }}
                    className="text-muted hover:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? "border-brass bg-brass/5" : "border-rule hover:border-brass/50 hover:bg-paperdim/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-brass mx-auto mb-2" />
                  <p className="text-sm text-nfdark font-medium">Drop your CV here or <span className="text-brass underline">browse</span></p>
                  <p className="text-xs text-muted mt-1">PDF or Word · Max 10 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFileChange(e.target.files[0]); }}
                  />
                </div>
              )}
            </div>

            {/* Cover Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-nfdark">Cover Note <span className="text-muted font-normal">(optional)</span></label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Tell us why you're a great fit for this role…"
                rows={4}
                className="w-full border rule-hairline rounded-lg px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:border-brass transition-colors bg-paper resize-none"
              />
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#45DB61] hover:bg-[#26c744] disabled:opacity-60 disabled:cursor-not-allowed text-[#002325] py-3.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Application"
              )}
            </button>

            <p className="text-center text-xs text-muted">
              By applying you agree to our{" "}
              <a href="/contact" className="underline hover:text-ink">Privacy Policy</a>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
