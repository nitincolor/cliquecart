"use client";

import { signOut, useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();

  return (
    <div className="p-6 bg-white rounded-lg shadow-1">
      <p className="text-dark">
        Hello {session?.user?.name} (not {session?.user?.name} ?
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="pl-1 duration-200 ease-out text-red hover:underline"
        >
          Log Out
        </button>
        )
      </p>

      <p className="mt-4 text-custom-sm">
        From your account dashboard you can view your recent orders, manage your
        shipping and billing addresses, and edit your password and account
        details.
      </p>
    </div>
  );
}
