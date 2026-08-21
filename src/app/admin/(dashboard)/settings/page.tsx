"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminSettingsPage() {
  const [supabase] = useState(() => createClient());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
      setSettings(data as Settings);
    })();
  }, [supabase]);

  if (!settings) return <p className="text-muted">Loading…</p>;

  function toggleDay(day: number) {
    if (!settings) return;
    const has = settings.working_days.includes(day);
    const working_days = has
      ? settings.working_days.filter((d) => d !== day)
      : [...settings.working_days, day].sort();
    setSettings({ ...settings, working_days });
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    await supabase
      .from("settings")
      .update({
        working_days: settings.working_days,
        day_start_time: settings.day_start_time,
        day_end_time: settings.day_end_time,
        slot_duration_mins: settings.slot_duration_mins,
        timezone: settings.timezone,
        interviewer_name: settings.interviewer_name,
        interviewer_photo_url: settings.interviewer_photo_url || null,
        meeting_type: settings.meeting_type,
      })
      .eq("id", 1);
    setSaving(false);
    setSaved(true);
  }

  const labelClass = "font-mono text-xs uppercase tracking-widest2 text-muted";
  const inputClass =
    "mt-2 w-full border-b-2 rule-hairline bg-transparent py-2 text-ink outline-none focus:border-brass transition-colors";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl text-ink mb-8">Scheduling Settings</h1>

      <h2 className="font-mono text-xs uppercase tracking-widest2 text-brass mb-4">Interviewer</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Name</label>
          <input
            value={settings.interviewer_name}
            onChange={(e) => setSettings({ ...settings, interviewer_name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Meeting Type Label</label>
          <input
            value={settings.meeting_type}
            onChange={(e) => setSettings({ ...settings, meeting_type: e.target.value })}
            className={inputClass}
            placeholder="Phone Call"
          />
        </div>
      </div>
      <div className="mt-6">
        <label className={labelClass}>Photo URL</label>
        <input
          value={settings.interviewer_photo_url ?? ""}
          onChange={(e) => setSettings({ ...settings, interviewer_photo_url: e.target.value })}
          className={inputClass}
          placeholder="https://…"
        />
        <p className="mt-2 text-xs text-muted">
          Leave blank to show initials instead of a photo. Paste a direct image URL (e.g. from your own hosting or
          Supabase Storage) — uploading isn&rsquo;t supported here yet.
        </p>
      </div>

      <h2 className="font-mono text-xs uppercase tracking-widest2 text-brass mb-4 mt-12">Availability</h2>
      <div>
        <label className={labelClass}>Working Days</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {DAY_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleDay(i)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest2 border rule-hairline transition-colors ${
                settings.working_days.includes(i) ? "bg-ink text-paper border-ink" : "text-muted hover:border-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div>
          <label className={labelClass}>Day Starts</label>
          <input
            type="time"
            value={settings.day_start_time.slice(0, 5)}
            onChange={(e) => setSettings({ ...settings, day_start_time: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Day Ends</label>
          <input
            type="time"
            value={settings.day_end_time.slice(0, 5)}
            onChange={(e) => setSettings({ ...settings, day_end_time: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-8">
        <label className={labelClass}>Slot Duration (minutes)</label>
        <input
          type="number"
          min={10}
          step={5}
          value={settings.slot_duration_mins}
          onChange={(e) => setSettings({ ...settings, slot_duration_mins: Number(e.target.value) })}
          className={inputClass}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-10 bg-ink text-paper px-7 py-4 font-mono text-xs uppercase tracking-widest2 hover:bg-brassdim transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save Settings"}
      </button>
    </div>
  );
}
