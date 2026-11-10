import AuthCard from "@/components/auth-card";
import ForgotForm from "./forgot-form";

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot Password"
            subtitle="Enter your recruiter email and we will send you a link to choose a new password"
        >
            <ForgotForm />
        </AuthCard>
    );
}