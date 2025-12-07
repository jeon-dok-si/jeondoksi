'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User } from '@/types';
import styles from './page.module.css';

// Personality Type Definitions
const PERSONALITY_TYPES = {
    PHILOSOPHER: {
        title: '사색하는 철학자',
        desc: '단순히 글자를 읽는 것을 넘어, 책 속에 담긴 깊은 의미와 철학적 질문을 탐구합니다. 저자의 의도를 파악하고 자신의 삶과 연결 지어 깊이 있게 사색하는 것을 즐기는 당신은, 독서를 통해 끊임없이 자아를 성찰하고 성장하는 진정한 철학자입니다.',
        icon: '🤔',
        tags: ['#통찰력', '#깊은사고', '#지혜탐구', '#자아성찰']
    },
    ANALYST: {
        title: '냉철한 분석가',
        desc: '책의 논리적 구조와 인과관계를 파악하는 데 탁월한 능력을 보입니다. 정보를 비판적으로 수용하며, 저자의 주장에 대한 근거를 꼼꼼히 따져보는 당신은, 독서를 통해 지적 유희를 즐기고 명확한 해답을 찾아가는 지적인 탐험가입니다.',
        icon: '🧐',
        tags: ['#논리적', '#비판적', '#구조파악', '#팩트체크']
    },
    EMPATH: {
        title: '감성적인 공감러',
        desc: '등장인물의 감정에 깊이 이입하여 함께 울고 웃을 수 있는 따뜻한 마음을 가졌습니다. 문장 하나하나에 담긴 정서를 섬세하게 느끼며, 책이 주는 감동과 여운을 오랫동안 간직하는 당신은, 독서를 통해 타인의 삶을 이해하고 공감하는 능력을 키워갑니다.',
        icon: '🥰',
        tags: ['#감성이입', '#공감능력', '#감동', '#풍부한감성']
    },
    ACTIVIST: {
        title: '행동하는 실천가',
        desc: '책에서 얻은 깨달음을 머릿속에만 가두지 않고, 즉시 삶의 현장에 적용하여 변화를 만들어냅니다. 독서는 곧 행동을 위한 준비 과정이라고 믿는 당신은, 지식을 통해 세상을 긍정적으로 바꾸고자 노력하는 열정적인 리더입니다.',
        icon: '🏃',
        tags: ['#실천력', '#변화주도', '#적용', '#리더십']
    },
    STRATEGIST: {
        title: '용의주도한 전략가',
        desc: '치밀한 논리와 분석을 바탕으로 계획을 세우고, 이를 주저 없이 실행에 옮기는 스타일입니다. 독서를 통해 얻은 지식을 현실의 문제 해결에 적극적으로 활용하며, 생각과 행동이 일치하는 당신은 탁월한 전략가입니다.',
        icon: '♟️',
        tags: ['#지행합일', '#전략적', '#계획실천', '#문제해결']
    },
    VISIONARY: {
        title: '영감을 주는 모험가',
        desc: '책에서 얻은 깊은 감동과 열정을 원동력 삼아, 세상을 향해 적극적으로 나아가는 스타일입니다. 당신의 독서는 단순한 감상을 넘어 새로운 도전을 위한 영감이 되며, 주변 사람들에게 긍정적인 에너지를 전파하는 모험가입니다.',
        icon: '🚀',
        tags: ['#열정', '#영감', '#도전', '#동기부여']
    },
    SAGE: {
        title: '통달한 현자',
        desc: '논리, 감성, 행동 모든 면에서 뛰어난 균형을 갖춘 완성형 독서가입니다.',
        icon: '�',
        tags: ['#올라운더', '#완벽한균형', '#통찰력']
    },
    READER: {
        title: '성실한 독서가',
        desc: '하루도 빠짐없이 책을 펼치는 꾸준함과 성실함이 당신의 가장 큰 무기입니다. 독서를 일상의 자연스러운 습관으로 만들었으며, 티끌 모아 태산처럼 쌓여가는 지식의 힘을 믿는 당신은, 묵묵히 자신의 길을 걸어가는 끈기 있는 독자입니다.',
        icon: '📚',
        tags: ['#꾸준함', '#성실', '#습관', '#끈기']
    }
};

export default function PersonalityPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/v1/users/me');
                setUser(res.data.data);
            } catch (err) {
                console.error(err);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    if (isLoading) return <div className={styles.loading}>분석 중...</div>;
    if (!user) return null;

    // Stats for Radar Chart
    const stats = user.stats || { logic: 0, emotion: 0, action: 0 };
    const maxStat = 100; // Normalized to 100

    // Calculate Polygon Points (Triangle)
    // Center: 150, 150. Radius: 100.
    // Logic (Top): 0 deg (at -90 deg in SVG coords)
    // Emotion (Bottom Right): 120 deg
    // Action (Bottom Left): 240 deg

    const center = 150;
    const radius = 100;

    const getPoint = (value: number, angle: number) => {
        const r = (value / maxStat) * radius;
        const rad = (angle - 90) * (Math.PI / 180);
        return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
    };

    const p1 = getPoint(stats.logic, 0);     // Top
    const p2 = getPoint(stats.emotion, 120); // Bottom Right
    const p3 = getPoint(stats.action, 240);  // Bottom Left

    const dominantTypeKey = user.dominantType as keyof typeof PERSONALITY_TYPES;
    const myType = PERSONALITY_TYPES[dominantTypeKey] || PERSONALITY_TYPES.READER;

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.chartContainer}>
                    <svg viewBox="0 0 300 300" className={styles.radarSvg}>
                        {/* Background Triangle (Max) */}
                        <polygon
                            points={`${getPoint(100, 0)} ${getPoint(100, 120)} ${getPoint(100, 240)}`}
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="1"
                        />
                        {/* Mid Triangle (50%) */}
                        <polygon
                            points={`${getPoint(50, 0)} ${getPoint(50, 120)} ${getPoint(50, 240)}`}
                            fill="none"
                            stroke="#F1F5F9"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />

                        {/* Axes */}
                        <line x1={center} y1={center} x2={getPoint(100, 0).split(',')[0]} y2={getPoint(100, 0).split(',')[1]} className={styles.radarAxis} />
                        <line x1={center} y1={center} x2={getPoint(100, 120).split(',')[0]} y2={getPoint(100, 120).split(',')[1]} className={styles.radarAxis} />
                        <line x1={center} y1={center} x2={getPoint(100, 240).split(',')[0]} y2={getPoint(100, 240).split(',')[1]} className={styles.radarAxis} />

                        {/* Data Polygon */}
                        <polygon
                            points={`${p1} ${p2} ${p3}`}
                            className={styles.radarPolygon}
                        />

                        {/* Labels */}
                        <text x="150" y="30" textAnchor="middle" className={styles.radarLabel}>논리 ({stats.logic})</text>
                        <text x="260" y="220" textAnchor="middle" className={styles.radarLabel}>감성 ({stats.emotion})</text>
                        <text x="40" y="220" textAnchor="middle" className={styles.radarLabel}>행동 ({stats.action})</text>
                    </svg>
                </div>

                <div className={styles.typeInfo}>
                    <span className={styles.myLabel}>나의 독서 성향</span>
                    <h1 className={styles.typeTitle}>{myType.title}</h1>
                    <p className={styles.typeDesc}>{myType.desc}</p>
                    <div className={styles.typeTags}>
                        {myType.tags.map(tag => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Types Grid */}
            <section className={styles.gridSection}>
                <h2 className={styles.sectionTitle}>전체 성향 유형</h2>
                <div className={styles.typesGrid}>
                    {Object.entries(PERSONALITY_TYPES).map(([key, info]) => (
                        <div
                            key={key}
                            className={`${styles.typeCard} ${key === dominantTypeKey ? styles.active : ''}`}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIcon}>{info.icon}</span>
                                {key === dominantTypeKey && <span className={styles.myLabel} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>MY</span>}
                            </div>
                            <h3 className={styles.cardTitle}>{info.title}</h3>
                            <p className={styles.cardDesc}>{info.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
