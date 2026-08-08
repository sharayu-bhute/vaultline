"use client";

import { useState, useRef, useEffect } from "react";

export default function UserMenu({
  name,
  image,
  signOutAction,
  deleteAccountAction,
}: {
  name: string | null | undefined;
  image: string | null | undefined;
  signOutAction: () => Promise<void>;
  deleteAccountAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmingDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[#EEEDFE] flex items-center justify-center text-sm font-medium text-[#26215C] overflow-hidden flex-shrink-0">
          {image ? (
            <img src={image} alt="" className="w-8 h-8 object-cover" />
          ) : (
            name?.[0] ?? "?"
          )}
        </div>
        <span className="text-sm text-gray-600 hidden sm:inline">{name}</span>
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
          {!confirmingDelete ? (
            <>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Sign out
                </button>
              </form>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete account
              </button>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-600 mb-3">
                This permanently deletes your account and unlinks your scans
                and reviews. It also revokes this app&apos;s access on
                GitHub. This can&apos;t be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <form action={deleteAccountAction} className="flex-1">
                  <button
                    type="submit"
                    className="w-full text-sm px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}