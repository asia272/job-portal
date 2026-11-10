"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { getUploadSignature, saveResume } from "@/actions/resume";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ResumeUploader({
    resumeUrl,
    fileName,
}: {
    resumeUrl: string | null;
    fileName: string | null;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = ""; // lets the user pick the same file again later
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
        }
        if (file.size > MAX_SIZE) {
            toast.error("File must be smaller than 5 MB");
            return;
        }

        setLoading(true);
        try {
            const sig = await getUploadSignature();

            const form = new FormData();
            form.append("file", file);
            form.append("api_key", sig.apiKey);
            form.append("timestamp", String(sig.timestamp));
            form.append("signature", sig.signature);
            form.append("folder", sig.folder);
            form.append("public_id", sig.public_id);

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${sig.cloudName}/raw/upload`,
                { method: "POST", body: form }
            );
            if (!res.ok) throw new Error("Upload failed. Please try again.");
            const uploaded = await res.json();

            const saved = await

                saveResume({
                    secureUrl: uploaded.secure_url,
                    publicId: uploaded.public_id,
                    fileName: file.name,
                });
            if (saved.error) throw new Error(saved.error);

            toast.success(resumeUrl ? "Resume updated" : "Resume uploaded");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    }

    const open = () => inputRef.current?.click();

    return (
        <div className="flex flex-wrap items-center gap-3">
            {resumeUrl ? (
                <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 max-w-[220px] items-center truncate rounded-[4px] bg-[#EFF5FF] px-4 text-[15px] text-[#0260FF] hover:underline"
                >
                    <span className="truncate">{fileName ?? "resume"}</span>
                </a>
            ) : (
                <span className="text-[15px] text-[#797484]">No resume uploaded yet</span>
            )}

            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onFile} />

            {resumeUrl && (
                <button
                    type="button"
                    onClick={open}
                    disabled={loading}
                    className="inline-flex h-9 w-[79px] cursor-pointer items-center justify-center rounded-[4px] border border-[#818181] bg-white text-[15px] text-[#818181] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "..." : "Edit"}
                </button>
            )}

            <button
                type="button"
                onClick={open}
                disabled={loading}
                aria-label={resumeUrl ? "Upload a new resume" : "Upload resume"}
                className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[4px] border border-[#0260FF] bg-[#0260FF] text-white transition-colors hover:bg-[#0150D6] disabled:cursor-not-allowed disabled:opacity-60 ${resumeUrl ? "w-9" : "px-4 text-[15px]"
                    }`}
            >
                <Upload className="size-[18px]" aria-hidden />
                {!resumeUrl && <span>{loading ? "Uploading..." : "Upload resume (PDF)"}</span>}
            </button>
        </div>
    );
}