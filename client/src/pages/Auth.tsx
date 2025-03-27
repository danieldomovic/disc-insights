import AuthForms from "@/components/auth/AuthForms";

export default function Auth() {
  return (
    <div className="container py-10 flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md">
        <AuthForms />
      </div>
    </div>
  );
}