"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { APP_THEME_IDS, DEFAULT_APP_THEME } from "@/lib/appThemes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 10_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  );

  return (
    // data-theme (not class) so named color themes work alongside light/dark.
    <ThemeProvider
      attribute="data-theme"
      defaultTheme={DEFAULT_APP_THEME}
      themes={APP_THEME_IDS}
      enableSystem={false}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: "10px",
              fontSize: "14px",
              background: "rgb(var(--surface))",
              color: "rgb(var(--text))",
              border: "1px solid rgb(var(--border))",
            },
            success: { iconTheme: { primary: "var(--accent-color)", secondary: "#fff" } },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
