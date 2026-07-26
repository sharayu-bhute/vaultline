import { auth, signIn } from "../../auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Find security issues before they ship
        </h1>
        <p className="text-gray-600 mb-8">
          Vaultline scans your repositories for hardcoded secrets, vulnerable
          dependencies, and misconfigurations — automatically, on every push.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}