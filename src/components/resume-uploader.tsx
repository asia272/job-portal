"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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

            const saved = await saveResume({
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

    return (
        <div className="flex flex-wrap items-center gap-2">
            {resumeUrl ? (
                <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:underline"
                >
                    <FileText className="h-4 w-4" />
                    {fileName ?? "resume.pdf"}
                </a>
            ) : (
                <span className="text-sm text-gray-500">No resume uploaded yet</span>
            )}

            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onFile} />

            {resumeUrl && (
                <Button variant="outline" size="sm" disabled={loading} onClick={() => inputRef.current?.click()}>
                    {loading ? "Uploading..." : "Edit"}
                </Button>
            )}
            <Button
                size={resumeUrl ? "icon" : "sm"}
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                aria-label="Upload resume"
            >
                <Upload className="h-4 w-4" />
                {!resumeUrl && <span className="ml-2">{loading ? "Uploading..." : "Upload resume (PDF)"}</span>}
            </Button>
        </div>
    );
}