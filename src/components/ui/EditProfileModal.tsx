"use client";

import { useState } from "react";
import { useAuthStore, useNotificationStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const [displayName, setDisplayName] = useState(user?.profile.display_name || "");
  const [bio, setBio] = useState(user?.profile.bio || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, bio }),
    });

    const json = await res.json();
    if (!res.ok) {
      addNotification({ type: "error", message: json.error?.message || "Update failed" });
    } else {
      setUser({ ...user, profile: { ...user.profile, ...json.data } });
      addNotification({ type: "success", message: "Profile updated!" });
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <div className="p-5 space-y-4">
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          maxLength={50}
        />
        <div>
          <label className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={200}
            className="input-field resize-none"
          />
          <p className="text-right text-[11px] text-white/20 font-mono mt-1">{bio.length}/200</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button loading={loading} icon={<Save size={14} />} onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
