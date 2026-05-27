"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useReport } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: report, isLoading } = useReport(id);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!report) return;
    const shareData = {
      title: `Medical Report: ${report.test_name}`,
      text: `Check out my ${report.test_name} report from ${report.lab?.name || "MeddyNet"}.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share failed silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Copy failed
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto space-y-8 py-10">
        <div className="flex justify-between items-center">
           <div className="flex gap-4 items-center">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-4 w-48" />
              </div>
           </div>
           <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
           </div>
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-[600px] mx-auto py-16 text-center">
        <div className="w-20 h-20 bg-border rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-text-light" />
        </div>
        <h2 className="text-xl font-bold text-dark-light mb-2">Report Not Found</h2>
        <Link href="/dashboard/reports" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
      </div>
    );
  }

  const labName = report.lab?.name || "Diagnostic Lab";
  const testName = report.test_name || "Diagnostic Test";
  const reportDate = report.uploaded_at || new Date().toISOString();

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/reports" className="p-2 rounded-xl border border-border bg-white text-text-secondary hover:border-primary hover:text-primary transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-dark-light tracking-tight">Report Viewer</h1>
            <p className="text-sm text-text-light font-medium">{report.id.slice(0, 12)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-xs active:scale-95 ${
              copied 
                ? "bg-emerald-500 text-white border-emerald-500" 
                : "bg-white border border-border text-text-secondary hover:border-primary hover:text-primary shadow-sm"
            }`}
          >
            {copied ? (
              <><CheckCircle className="w-4 h-4" /> Copied!</>
            ) : (
              <><Share2 className="w-4 h-4" /> Share</>
            )}
          </button>
          {report.cloud_url ? (
            <a 
              href={report.cloud_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-primary-light text-white rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>
          ) : (
            <button disabled className="flex items-center gap-2 px-5 py-2.5 bg-surface text-text-light rounded-xl text-sm font-bold">
              <Download className="w-4 h-4" /> Not Available
            </button>
          )}
        </div>
      </div>

      {/* Report Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-black text-dark-light text-lg">{testName}</h2>
              <p className="text-sm text-text-muted font-medium">{labName}</p>
              <p className="text-xs text-text-light font-medium mt-0.5">
                {new Date(reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${report.status === "Ready" ? "bg-primary/10 text-primary" : "bg-orange-50 text-orange-600"}`}>
              {report.status === "Ready" ? <CheckCircle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5 animate-pulse" />}
              {report.status}
            </span>
            {report.is_abnormal && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-error">
                <AlertTriangle className="w-3.5 h-3.5" /> Abnormal Values
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* PDF Viewer / Report Preview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="font-black text-dark-light text-sm">Digital Report</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-light bg-border px-2.5 py-1 rounded-full">PDF</span>
            </div>
          </div>

          <div className="bg-white p-8 space-y-6">
            {/* Report header */}
            <div className="flex items-start justify-between border-b border-border pb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent text-white flex items-center justify-center text-xs font-black">M</div>
                  <div>
                    <p className="font-black text-dark-light text-sm">MeddyNet Diagnostics</p>
                    <p className="text-[10px] text-text-light">Powered by {labName}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-dark-light">{report.id.slice(0, 12)}...</p>
                <p className="text-[10px] text-text-light mt-0.5">{new Date(reportDate).toLocaleDateString("en-IN")}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-dark-light">Test: <span className="text-text-secondary font-semibold">{testName}</span></p>
              <p className="text-xs font-black text-dark-light mt-1">Lab: <span className="text-text-secondary font-semibold">{labName}</span></p>
            </div>

            {/* Cloud URL Preview */}
            {report.cloud_url ? (
              <div className="border border-border rounded-xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-dark-light">Your report is ready for download</p>
                  <p className="text-xs text-text-muted font-medium mt-1">File size: {report.file_size_bytes ? `${(report.file_size_bytes / 1024).toFixed(1)} KB` : "N/A"}</p>
                </div>
                <a 
                  href={report.cloud_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-dark text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-dark-light transition-all shadow-lg shadow-dark/10 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Open Report File
                </a>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="skeleton w-full h-4 rounded mb-3" />
                <div className="skeleton w-3/4 h-4 rounded mb-3 mx-auto" />
                <div className="skeleton w-full h-4 rounded mb-3" />
                <p className="text-xs text-text-light font-medium mt-4">Report processing...</p>
              </div>
            )}
          </div>
        </div>

        {report.is_abnormal && (
          <div className="mt-4 p-4 bg-error/10 rounded-xl border border-error/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-error">Abnormal Values Detected</p>
              <p className="text-xs text-error/80 font-medium mt-0.5">Some parameters are outside the normal range. Please consult your doctor for interpretation.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
