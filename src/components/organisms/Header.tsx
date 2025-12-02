'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';

export const Header = () => {
    const pathname = usePathname();
    const router = useRouter();

    // Hide header on auth pages
    if (pathname === '/login' || pathname === '/signup') return null;

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        router.push('/login');
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    전지적 독자 시점
                </Link>
                <nav className={styles.nav}>
                    <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
                        홈
                    </Link>
                    <Link href="/explore" className={`${styles.link} ${pathname === '/explore' ? styles.active : ''}`}>
                        책 탐험
                    </Link>
                    <Link href="/library" className={`${styles.link} ${pathname === '/library' ? styles.active : ''}`}>
                        나의 서재
                    </Link>
                    <Link href="/personality" className={`${styles.link} ${pathname === '/personality' ? styles.active : ''}`}>
                        성향
                    </Link>
                    <Link href="/character" className={`${styles.link} ${pathname === '/character' ? styles.active : ''}`}>
                        캐릭터
                    </Link>
                    <Link href="/shop" className={`${styles.link} ${pathname === '/shop' ? styles.active : ''}`}>
                        상점
                    </Link>
                    <Link href="/search" className={styles.writeButton}>
                        독후감 작성하기
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        로그아웃
                    </button>
                </nav>
            </div>
        </header >
    );
};
