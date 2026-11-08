"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

    return (
        <div className="flex items-center gap-2">
            <Button
                size="sm"
                disabled={pending || status === "ACCEPTED"}
                onClick={() => change("ACCEPTED")}
                className="bg-green-600 hover:bg-green-700"
            >
                Accept
            </Button>
            <Button
                size="sm"
                variant="outline"
                disabled={pending || status === "REJECTED"}
                onClick={() => change("REJECTED")}
                className="border-red-200 text-red-600 hover:bg-red-50"
            >
                Reject
            </Button>
            {status !== "PENDING" && (
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => change("PENDING")}
                    className="text-xs text-gray-500 underline disabled:opacity-50"
                >
                    Undo
                </button>
            )}
        </div>
    );
}