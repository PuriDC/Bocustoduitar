import { useState } from "react";
import { humanizePath, isImageField, isLongText } from "../../content/paths";

const INPUT =
  "w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 " +
  "border-slate-200 hover:border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";

type Props = {
  /** Full dotted path, e.g. `home.hero.eyebrow`. */
  fieldKey: string;
  /** Currently published value. */
  published: string;
  /** Unsaved edit, if any. */
  draft?: string;
  /** True when the database holds an override for this key. */
  isOverridden: boolean;
  /** How many leading segments of the key to drop from the label. */
  labelDepth: number;
  onChange: (next: string) => void;
  onReset: () => void;
  /** Uploads the file and resolves to the URL it is served from. */
  onUpload: (file: File) => Promise<string>;
};

export default function FieldEditor({
  fieldKey,
  published,
  draft,
  isOverridden,
  labelDepth,
  onChange,
  onReset,
  onUpload
}: Props) {
  const value = draft ?? published;
  const isDirty = draft !== undefined;
  const label = humanizePath(fieldKey.split(".").slice(labelDepth).join(".")) || humanizePath(fieldKey);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  /**
   * The file is stored on the server and only its URL goes into the field.
   * Inlining it as a data URL used to blow past the value-length limit for
   * anything above roughly 15 KB, and would have shipped every image to every
   * visitor inside the content JSON.
   */
  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      onChange(await onUpload(file));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="group/field">
      <div className="flex items-center justify-between gap-3 mb-1.5 min-h-[22px]">
        <label htmlFor={fieldKey} className="text-[13px] font-semibold text-slate-700 truncate">
          {label}
        </label>
        <div className="flex items-center gap-2 shrink-0">
          {isDirty && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              ยังไม่บันทึก
            </span>
          )}
          {(isDirty || isOverridden) && (
            <button
              onClick={onReset}
              title="คืนค่าข้อความต้นฉบับ"
              className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover/field:opacity-100 focus:opacity-100"
            >
              <span className="material-symbols-outlined text-[18px] leading-none">undo</span>
            </button>
          )}
        </div>
      </div>

      {isImageField(fieldKey, published) ? (
        <div className="flex gap-3">
          <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            {value && (
              <img
                src={value}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.15";
                }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <input
              id={fieldKey}
              type="text"
              className={INPUT}
              value={value}
              placeholder="วาง URL รูปภาพ หรือเลือกไฟล์"
              onChange={(e) => onChange(e.target.value)}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition ${
                  uploading ? "opacity-50 cursor-wait" : "hover:bg-slate-50 cursor-pointer"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-base leading-none ${uploading ? "animate-spin" : ""}`}
                >
                  {uploading ? "progress_activity" : "upload"}
                </span>
                {uploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    // Reset so picking the same file twice still fires onChange.
                    e.target.value = "";
                    if (file) void handleFile(file);
                  }}
                />
              </label>
              {value.startsWith("/uploads/") && (
                <span className="text-[11px] font-semibold text-emerald-600">อัปโหลดแล้ว</span>
              )}
              {uploadError && <span className="text-[11px] font-semibold text-rose-600">{uploadError}</span>}
            </div>
          </div>
        </div>
      ) : isLongText(published) ? (
        <textarea
          id={fieldKey}
          rows={Math.min(8, Math.max(3, Math.ceil(value.length / 70)))}
          className={`${INPUT} resize-y leading-relaxed`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input id={fieldKey} type="text" className={INPUT} value={value} onChange={(e) => onChange(e.target.value)} />
      )}

      <p className="mt-1.5 text-[10px] font-mono text-slate-300 break-all opacity-0 group-hover/field:opacity-100 transition">
        {fieldKey}
      </p>
    </div>
  );
}
