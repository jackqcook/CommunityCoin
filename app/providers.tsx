"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a client instance that persists across renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long data is considered fresh
            staleTime: 30 * 1000, // 30 seconds
            // Cache time: how long to keep unused data in cache
            gcTime: 5 * 60 * 1000, // 5 minutes
            // Retry failed requests
            retry: 2,
            // Refetch on window focus
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          // Customize login methods
          loginMethods: ["email", "wallet", "google", "twitter"],
          // Appearance
          appearance: {
            theme: "light",
            accentColor: "#E63946", // ember color
            logo: undefined,
            showWalletLoginFirst: false,
          },
          // Embedded wallet config
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
        }}
      >
        {children}
      </PrivyProvider>
    </QueryClientProvider>
  );
}
