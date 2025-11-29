'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './LandingPage.module.css';

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.title}>
                    전지적 독자 시점
                </h1>
                <p className={styles.subtitle}>
                    당신의 독서가 기록되고, 분석되고, 성장하는 곳.<br />
                    단순한 기록을 넘어 나만의 독서 세계를 만들어보세요.
                </p>
                <button
                    className={styles.ctaButton}
                    onClick={() => router.push('/login')}
                >
                    시작하기
                </button>
            </div>

            <div className={styles.features}>
                <div className={styles.featureCard}>
                    <span className={styles.featureIcon}>📝</span>
                    <h3 className={styles.featureTitle}>독후감 & AI 분석</h3>
                    <p className={styles.featureDesc}>
                        독후감을 작성하면 AI가 당신의 성향을 분석해줍니다.
                        논리, 감성, 행동 점수로 나만의 독서 스타일을 알아보세요.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <span className={styles.featureIcon}>🧠</span>
                    <h3 className={styles.featureTitle}>맞춤형 퀴즈</h3>
                    <p className={styles.featureDesc}>
                        읽은 책 내용을 바탕으로 생성되는 퀴즈를 풀어보세요.
                        책의 내용을 얼마나 잘 이해했는지 확인할 수 있습니다.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <span className={styles.featureIcon}>🎮</span>
                    <h3 className={styles.featureTitle}>게이미피케이션</h3>
                    <p className={styles.featureDesc}>
                        독서 활동으로 경험치와 포인트를 획득하세요.
                        레벨을 올리고 나만의 캐릭터를 꾸밀 수 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
