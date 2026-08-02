import { auth, signOut } from "../../auth";
import Link from "next/link";
import Logo from "./logo";
import UserMenu from "./UserMenu";

export default async function Navbar() {
  const session = await auth();

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between relative">
        <Link href="/">
          <Logo size={22} />
        </Link>

        <div className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-gray-50 rounded-full p-1 border border-gray-100">
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-[#26215C] hover:bg-white hover:shadow-sm transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/reports"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-[#26215C] hover:bg-white hover:shadow-sm transition-all"
          >
            Reports
          </Link>
          <Link
            href="/about"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-[#26215C] hover:bg-white hover:shadow-sm transition-all"
          >
            About
          </Link>
          <Link
            href="/reviews"
            className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:text-[#26215C] hover:bg-white hover:shadow-sm transition-all"
          >
            Reviews
          </Link>
        </div>

        {session?.user && (
          <UserMenu
            name={session.user.name}
            image={session.user.image}
            signOutAction={handleSignOut}
          />
        )}
      </div>
    </nav>
  );
}