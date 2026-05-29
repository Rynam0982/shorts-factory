import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
