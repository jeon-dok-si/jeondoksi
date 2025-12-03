'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Boss } from '@/types';
import styles from '../boss-raid.module.css';

export default function BossDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bossId = params.id;
    const [boss, setBoss] = useState<Boss | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (bossId) {
            fetchBossDetail();
        }
    }, [bossId]);

    const fetchBossDetail = async () => {
        try {
            const res = await api.get(`/api/v1/bosses/${bossId}`);
            setBoss(res.data);
        } catch (err) {
            console.error(err);
            alert('보스 정보를 불러오는데 실패했습니다.');
            router.push('/boss-raid');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !boss) return <div className={styles.container}>로딩 중...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.detailContainer}>
                <img
                    src={boss.imageUrl || '/images/default-boss.png'}
                    alt={boss.name}
                    className={styles.detailImage}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Boss';
                    }}
                />
                <div className={styles.detailInfo}>
                    <div className={`${styles.statusBadge} ${boss.isActive ? styles.active : styles.inactive}`}>
                        {boss.isActive ? '진행 중' : '토벌 완료'}
                    </div>
                    <span className={styles.bossLevel} style={{ fontSize: '1rem', marginLeft: '1rem' }}>
                        Lv. {boss.level}
                    </span>

                    <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{boss.name}</h1>

                    <div className={styles.hpBarContainer} style={{ height: '20px' }}>
                        <div
                            className={styles.hpBarFill}
                            style={{ width: `${(boss.currentHp / boss.maxHp) * 100}%` }}
                        />
                    </div>
                    <div className={styles.hpText} style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP
                    </div>

                    <p className={styles.description}>{boss.description}</p>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            style={{
                                padding: '1rem 2rem',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                            onClick={() => router.push('/search')}
                        >
                            ⚔️ 독후감 쓰고 공격하기
                        </button>
                        <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
                            * 독후감을 작성하면 자동으로 보스를 공격합니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
