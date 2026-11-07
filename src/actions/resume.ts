"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { getCurrentCandidate } from "@/lib/candidate";

export async function getUploadSignature() {
    const candidate = await getCurrentCandidate();
    if (!candidate) throw new Error("Unauthorized");

    const timestamp = Math.round(Date.now() / 1000);
    const params = { timestamp, folder: "resumes", public_id: `${candidate.id}_${timestamp}.pdf` };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    return {
        ...params,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    };
}

const saveSchema = z.object({
    secureUrl: z.string().url(),
    publicId: z.string(),
    fileName: z.string().max(200),
});

export async function saveResume(input: z.infer<typeof saveSchema>) {
    const candidate = await getCurrentCandidate();
    if (!candidate) return { error: "Unauthorized" };

    const data = saveSchema.safeParse(input);
    if (!data.success) return { error: "Invalid file" };

    // Don't trust the client: the file must be ours and belong to this candidate
    const ownsFile = data.data.publicId.startsWith(`resumes/${candidate.id}_`);
    const fromOurCloud = data.data.secureUrl.startsWith(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
    );
    if (!ownsFile || !fromOurCloud) return { error: "Invalid file" };

    const old = candidate.resumePublicId;
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

    // Delete the old file ONLY if no application still uses it
    if (old && oldUrl) {
        const stillUsed = await prisma.application.count({ where: { resumeUrl: oldUrl } });
        if (!stillUsed) await cloudinary.uploader.destroy(old, { resource_type: "raw" });
    }

    revalidatePath("/my-applications");
    return { success: true };
}