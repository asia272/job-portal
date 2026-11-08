"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";

// Step 1: the browser asks for a signed upload ticket (the secret never leaves the server)
export async function getUploadSignature() {
    const candidate = await getCurrentCandidate();
    if (!candidate) throw new Error("Please login first");

    const timestamp = Math.round(Date.now() / 1000);
    const params = {
        timestamp,
        folder: "resumes",
        public_id: `${candidate.id}_${timestamp}.pdf`,
    };
    const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET!
    );

    return {
        ...params,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    };
}

const saveSchema = z.object({
    secureUrl: z.string().url(),
    publicId: z.string().min(1).max(300),
    fileName: z.string().min(1).max(200),
});

// Step 2: after the upload, the browser reports the file and we store it
export async function saveResume(input: z.infer<typeof saveSchema>) {
    const candidate = await getCurrentCandidate();
    if (!candidate) return { error: "Please login first" };

    const data = saveSchema.safeParse(input);
    if (!data.success) return { error: "Invalid file" };

    // Never trust the client: the file must be in our cloud and belong to this candidate
    const ownsFile = data.data.publicId.startsWith(`resumes/${candidate.id}_`);
    const fromOurCloud = data.data.secureUrl.startsWith(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
    );
    if (!ownsFile || !fromOurCloud) return { error: "Invalid file" };

    const oldPublicId = candidate.resumePublicId;
    const oldUrl = candidate.resumeUrl;

    await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
            resumeUrl: data.data.secureUrl,
            resumePublicId: data.data.publicId,
            resumeFileName: data.data.fileName,
            resumeUpdatedAt: new Date(),
        },
    });

    // Delete the old file only if no application still points to it
    // (recruiters must keep seeing the resume that was sent when the candidate applied)
    if (oldPublicId && oldUrl) {
        try {
            const stillUsed = await prisma.application.count({ where: { resumeUrl: oldUrl } });
            if (!stillUsed) {
                await cloudinary.uploader.destroy(oldPublicId, { resource_type: "raw" });
            }
        } catch (e) {
            console.error("old resume cleanup failed:", e); // not fatal
        }
    }

    revalidatePath("/my-applications");
    revalidatePath("/jobs", "layout"); // job pages re-check "has resume"
    return { success: true };
}