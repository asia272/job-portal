import AuthCard from "@/components/auth-card";
import RegisterForm from "./register-form";

export default function RecruiterRegisterPage() {
    return (
        <AuthCard title="Recruiter Sign Up" subtitle="Create your account to start hiring">
            <RegisterForm />
        </AuthCard>
    );
}