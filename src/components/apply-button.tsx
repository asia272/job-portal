"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applyToJob } from "@/actions/apply";

export type ApplyState = "guest" | "no-resume" | "can-apply" | "applied";

const BASE =
    "inline-flex h-[50px] w-[180px] items-center justify-center rounded-[5px] text-[16px] shadow-[0px_4px_15px_0px_#0000000D] transition-colors";

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
            <button
                type="button"
                disabled
                className={`${BASE} cursor-not-allowed border border-[#0260FF] bg-white text-[#0260FF]`}
            >
                Already Applied
            </button>
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
        <button
            type="button"
            onClick={onClick}
            disabled={pending}
            className={`${BASE} cursor-pointer bg-[#0260FF] text-white hover:bg-[#0150D6] disabled:cursor-not-allowed disabled:opacity-70`}
        >
            {pending ? "Applying..." : "Apply now"}
        </button>
    );
}