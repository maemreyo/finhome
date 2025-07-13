import type { ReactNode } from 'react';

declare global {
  type PageProps = {
    params: Promise<{ locale: string; [key: string]: any }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  };

  type LayoutProps = {
    children: ReactNode;
    params: Promise<{ locale: string; [key: string]: any }>;
  };
}
