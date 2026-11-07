"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUploadSignature, saveResume } from "@/actions/resume";

const MAX = 5 * 1024 * 1024;

export default function ResumeUploader({ resumeUrl, fileName }: { resumeUrl: string | null; fileName: string | null }) {
    const input = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (file.type !== "application/pdf") return toast.error("Only PDF files are allowed");
        if (file.size > MAX) return toast.error("File must be under 5 MB");

        setLoading(true);
        try {
            const s = await getUploadSignature();
            const form = new FormData();
            form.append("file", file);
            form.append("api_key", s.apiKey);
            form.append("timestamp", String(s.timestamp));
            form.append("signature", s.signature);
            form.append("folder", s.folder);
            form.append("public_id", s.public_id);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/raw/upload`, { method: "POST", body: form });
            if (!res.ok) throw new Error("Upload failed");
            const up = await res.json();

            const saved = await saveResume({ secureUrl: up.secure_url, publicId: up.public_id, fileName: file.name });
            if (saved.error) throw new Error(saved.error);
            toast.success("Resume updated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            {resumeUrl && (
                <a href={resumeUrl} target="_blank" className="rounded bg-blue-50 px-3 py-1 text-sm text-blue-600">
                    {fileName ?? "resume"}
                </a>
            )}
            <input ref={input} type="file" accept="application/pdf" hidden onChange={onFile} />
            {resumeUrl && <Button variant="outline" size="sm" disabled={loading} onClick={() => input.current?.click()}>Edit</Button>}
            <Button size="icon" disabled={loading} onClick={() => input.current?.click()}><Upload className="h-4 w-4" /></Button>
        </div>
    );
}