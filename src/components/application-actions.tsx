"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/actions/recruiter-jobs";

type Status = "PENDING" | "ACCEPTED" | "REJECTED";

export default function ApplicationActions({
    applicationId,
    status,
}: {
    applicationId: string;
    status: Status;
}) {
    const [pending, start] = useTransition();

    function change(next: Status) {
        start(async () => {
            const res = await updateApplicationStatus(applicationId, next);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            toast.success(
                next === "ACCEPTED"
                    ? "Application accepted"
                    : next === "REJECTED"
                        ? "Application rejected"
                        : "Moved back to pending"
            );
        });
    }

    const BTN =
        "inline-flex h-9 cursor-pointer items-center justify-center rounded-[4px] px-4 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                disabled={pending || status === "ACCEPTED"}
                onClick={() => change("ACCEPTED")}
                className={`${BTN} bg-[#0260FF] text-white hover:bg-[#0150D6]`}
            >
                Accept
            </button>
            <button
                type="button"
                disabled={pending || status === "REJECTED"}
                onClick={() => change("REJECTED")}
                className={`${BTN} border border-[#FFBABA] bg-[#FFF5F3] text-[#D92D2D] hover:bg-[#FFE8E3]`}
            >
                Reject
            </button>
            {status !== "PENDING" && (
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => change("PENDING")}
                    className="cursor-pointer text-[13px] text-[#797484] underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Undo
                </button>
            )}
        </div>
    );
}