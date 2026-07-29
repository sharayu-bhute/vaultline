import { auth, signOut } from "../../auth";
import Link from "next/link";
import Logo from "./logo";

export default async function Navbar () {
  const session = await auth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <Logo size={22} />
        </Link>

        {session?.user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-900 overflow-hidden">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="w-8 h-8" />
              ) : (
                session.user.name?.[0] ?? "?"
              )}
            </div>
            <span className="text-sm text-gray-600">{session.user.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="text-sm text-gray-500 underline">Sign out</button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}