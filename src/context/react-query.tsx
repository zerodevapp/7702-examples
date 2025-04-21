"use client";

import { type ReactNode, Suspense, useEffect, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const ReactQueryDevtoolsProduction = dynamic(
  () =>
    import("@tanstack/react-query-devtools/build/modern/production.js").then((d) => ({
      default: d.ReactQueryDevtools,
    })),
  {
    ssr: false,
  },
);

export const queryClient = new QueryClient();
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [enableDevtools, setEnableDevtools] = useState(false);

  useEffect(() => {
    window.toggleDevtools = () => setEnableDevtools((enabled) => !enabled);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {enableDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </Suspense>
      )}
      {children}
    </QueryClientProvider>
  );
}
