'use client';

import { SWRConfig, type Cache } from 'swr';
import React, { useMemo } from 'react';

export default function SWRProvider({
  children,
  ns
}: {
  children: React.ReactNode;
  ns: string;
}) {
  const provider = useMemo(() => {
    const map = new Map();
    return () => map as Cache;
  }, [ns]);

  return (
    <SWRConfig
      value={{
        provider,
        revalidateOnFocus: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
