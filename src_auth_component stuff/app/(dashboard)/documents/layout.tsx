import { ReactNode } from 'react';

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto py-4">
      {children}
    </div>
  );
} 