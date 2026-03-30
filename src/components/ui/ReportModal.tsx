"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Flag } from "lucide-react";
import { useAuthStore, useNotificationStore } from "@/store";
import { cn } from "@/lib/utils";

const REASONS = [
  "Spam or misleading",
  "Hate speech or harassment",
  "NSFW / inappropriate",
  "Copyright violation",
  "Other",
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  contentType: "meme" | "sound";
  contentId: string;
}

export function ReportModal({ open, onClose, contentType, contentId }: ReportModalProps) {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    // In production: POST to /api/reports with contentType, contentId, reason
    await new Promise((r) => setTimeout(r, 600));
    addNotification({ type: "success", message: "Report submitted. Thanks!" });
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Report Content">
      <div className="p-5 space-y-4">
        {!user && (
          <p className="text-sm text-yellow-400/80 glass px-3 py-2 rounded-xl border border-yellow-400/20">
            Sign in to submit a report
          </p>
        )}
        <p className="text-sm text-white/60">Why are you reporting this content?</p>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150",
                reason === r
                  ? "border-brand-500/50 bg-brand-500/10 text-white"
                  : "border-white/8 text-white/60 hover:border-white/20 hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            icon={<Flag size={14} />}
            loading={loading}
            disabled={!reason || !user}
            onClick={handleSubmit}
            className="flex-1"
          >
            Submit Report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
