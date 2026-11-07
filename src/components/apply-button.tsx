"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { applyToJob } from "@/actions/apply";

export type ApplyState = "guest" | "no-resume" | "can-apply" | "applied";

export default function ApplyButton({
    jobId,
    state,
}: {
    jobId: string;
    state: ApplyState;
}) {
    const [pending, start] = useTransition();
    const router = useRouter();

    if (state === "applied") {
        return (
            <Button disabled variant="secondary">
                Already Applied
            </Button>
        );
    }

    function onClick() {
        if (state === "guest") {
            toast.error("Please login to apply for this job");
            return;
        }

        if (state === "no-resume") {
            toast.error("Please upload your resume before applying", {
                action: {
                    label: "Upload",
                    onClick: () => router.push("/my-applications"),
                },
            });
            return;
        }

        start(async () => {
            const res = await applyToJob(jobId);
            if (res.error) toast.error(res.error);
            else toast.success("Application sent successfully");
            router.refresh(); // server recomputes the state, button becomes "Already Applied"
        });
    }

    return (
        <Button onClick={onClick} disabled={pending}>
            {pending ? "Applying..." : "Apply now"}
        </Button>
    );
}