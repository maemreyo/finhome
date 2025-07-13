import type { ReactNode } from 'react';

declare global {
  type PageProps = {
    params: Promise<any> & { locale: string };
    searchParams?: Promise<any> & { [key: string]: string | string[] | undefined };
  };

  type LayoutProps = {
    children: ReactNode;
    params: Promise<any> & { locale: string };
  };
}
