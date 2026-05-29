import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <SignUp fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
