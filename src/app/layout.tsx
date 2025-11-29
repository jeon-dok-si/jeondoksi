import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/organisms/Header';

export const metadata: Metadata = {
  title: '전지적 독자 시점 - 독서 기록 서비스',
  description: '독후감을 쓰고 퀴즈를 풀며 성장하는 독서 플랫폼',
};

import { ModalProvider } from '@/contexts/ModalContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ModalProvider>
          <Header />
          <main style={{ paddingTop: '60px' }}>
            {children}
          </main>
        </ModalProvider>
      </body>
    </html>
  );
}
