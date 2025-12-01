'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User, Book, Character } from '@/types';
import styles from './page.module.css';
import LandingPage from '@/components/templates/LandingPage';

export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [mainCharacter, setMainCharacter] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecLoading, setIsRecLoading] = useState(false);
    const [showLanding, setShowLanding] = useState(false);

    const fetchData = async () => {
        try {
            const [userRes, recRes, charRes] = await Promise.all([
                api.get('/api/v1/users/me'),
                api.get('/api/v1/recommendations'),
                api.get('/api/v1/characters'),
            ]);
            setUser(userRes.data.data);
            setRecommendations(recRes.data.data);

            // Determine Main Character
            // Determine Main Character
            const characters: Character[] = charRes.data.data;
            const equippedChar = characters.find(c => c.isEquipped) || characters[0];

            if (equippedChar) {
                setMainCharacter(equippedChar.imageUrl);
            } else {
                setMainCharacter("https://jeondoksi-files-20251127.s3.ap-southeast-2.amazonaws.com/basic_character.png");
            }

        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('accessToken');
                setShowLanding(true);
            } else {
                console.error(err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLanding(true);
            setIsLoading(false);
            return;
        }
        fetchData();
    }, [router]);

    const handleRefreshRecs = async () => {
        setIsRecLoading(true);
        try {
            const res = await api.get('/api/v1/recommendations');
            setRecommendations(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsRecLoading(false);
        }
    };

    if (isLoading) return <div className={styles.loading}>로딩 중...</div>;

    // Show Landing Page if not authenticated
    if (showLanding) {
        return <LandingPage />;
    }

    if (!user) return null;

    // Personality Type Logic
    const getPersonalityType = (l: number, e: number, a: number) => {
        if (l === 0 && e === 0 && a === 0) return '성장하는 독서가';
        const max = Math.max(l, e, a);
        if (max === l) return '냉철한 분석가';
        if (max === e) return '감성적인 공감러';
        return '실천하는 행동가';
    };

    const personalityType = getPersonalityType(user.stats.logic, user.stats.emotion, user.stats.action);

    // Access stats from the nested object
    const logic = user.stats.logic;
    const emotion = user.stats.emotion;
    const action = user.stats.action;

    // Fixed max stat for progress visualization (e.g. out of 100)
    const maxStat = 100;

    return (
        <div className={styles.container}>
            <div className={styles.bentoGrid}>
                {/* Left Column: Profile (Spans 2 rows visually by height) */}
                <div className={`${styles.card} ${styles.profileCard}`}>
                    <div>
                        <div className={styles.profileHeader}>
                            <div>
                                <h1 className={styles.greeting}>반가워요, {user.nickname}님!</h1>
                                <p className={styles.subGreeting}>오늘도 마음의 양식을 쌓아볼까요?</p>
                            </div>

                        </div>
                        <div className={styles.points}>
                            💰 {user.point} P
                        </div>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>논리</span>
                            <div className={styles.statTrack}>
                                <div
                                    className={`${styles.statFill} ${styles.logic}`}
                                    style={{ width: `${Math.min((logic / maxStat) * 100, 100)}%` }}
                                />
                            </div>
                            <span className={styles.statValue}>{logic}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>감성</span>
                            <div className={styles.statTrack}>
                                <div
                                    className={`${styles.statFill} ${styles.emotion}`}
                                    style={{ width: `${Math.min((emotion / maxStat) * 100, 100)}%` }}
                                />
                            </div>
                            <span className={styles.statValue}>{emotion}</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>행동</span>
                            <div className={styles.statTrack}>
                                <div
                                    className={`${styles.statFill} ${styles.action}`}
                                    style={{ width: `${Math.min((action / maxStat) * 100, 100)}%` }}
                                />
                            </div>
                            <span className={styles.statValue}>{action}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Character & Actions */}
                <div className={styles.rightColumn}>
                    <div
                        className={`${styles.card} ${styles.characterCard}`}
                        onClick={() => router.push('/character')}
                    >
                        <div className={styles.characterStage}>
                            {mainCharacter ? (
                                <img src={mainCharacter} alt="Main Character" className={styles.charLayer} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div className={styles.emptyChar}>?</div>
                            )}
                        </div>
                        <div className={styles.customizeLabel}>캐릭터 관리 ⚙️</div>
                    </div>

                    <div
                        className={`${styles.card} ${styles.actionCard}`}
                        onClick={() => router.push('/search')}
                    >
                        <div className={styles.actionText}>
                            <h3>독후감 쓰기</h3>
                            <p>책을 읽고 생각을 기록해보세요</p>
                        </div>
                        <div className={styles.actionIcon}>📝</div>
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <section className={styles.recSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>오늘의 추천 도서 📚</h2>
                    <button onClick={handleRefreshRecs} className={styles.refreshButton} disabled={isRecLoading}>
                        {isRecLoading ? '새로고침 중...' : '새로고침 ↻'}
                    </button>
                </div>

                <div className={styles.recGrid}>
                    {recommendations.map((book) => (
                        <div
                            key={book.isbn}
                            className={styles.bookCard}
                            onClick={() => router.push(`/report?isbn=${book.isbn}&title=${book.title}&thumbnail=${book.thumbnail}&author=${book.author}`)}
                        >
                            <img src={book.thumbnail} alt={book.title} className={styles.bookCover} />
                            <h3 className={styles.bookTitle}>{book.title}</h3>
                            <p className={styles.bookAuthor}>{book.author}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
