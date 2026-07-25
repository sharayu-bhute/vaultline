export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div>
          <span className="font-bold text-lg text-slate-900">
            Vault<span className="text-indigo-600">line</span>
          </span>
        </div>

        {/* User info (placeholder until auth is wired up) */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-sm font-medium text-slate-700">
            S
          </div>
          <span className="text-sm text-slate-600">sharayu</span>
        </div>
      </div>
    </nav>
  );
}