'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Boss, Guild } from '@/types';
import styles from './boss-raid.module.css';
import { useModal } from '@/contexts/ModalContext';
import confetti from 'canvas-confetti';

export default function BossRaidPage() {
    const router = useRouter();
    const { openModal, openConfirm } = useModal();
    const [guild, setGuild] = useState<Guild | null>(null);
    const [boss, setBoss] = useState<Boss | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [myNickname, setMyNickname] = useState('');
    const [showDamageEffect, setShowDamageEffect] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [pendingDamageEffect, setPendingDamageEffect] = useState(false);

    useEffect(() => {
        fetchMyGuildAndBoss();
        fetchMe();
    }, []);

    useEffect(() => {
        if (boss) {
            // Check for damage effect
            const lastHpKey = `boss_last_hp_${boss.id}`;
            const lastHpStr = localStorage.getItem(lastHpKey);

            if (lastHpStr) {
                const lastHp = parseInt(lastHpStr, 10);
                // If current HP is less than last known HP, queue damage effect
                if (boss.currentHp < lastHp && boss.isActive) {
                    setPendingDamageEffect(true);
                }
            }

            // Update last known HP
            localStorage.setItem(lastHpKey, boss.currentHp.toString());

            // Check for defeat confetti
            if (!boss.isActive) {
                // For confetti, we can also wait for image if desired, but user focused on damage.
                // Let's wait for image for consistency.
                // But confetti is global, maybe fine. Let's leave confetti as is for now unless requested.
                triggerConfetti();
            }
        }
    }, [boss]);

    useEffect(() => {
        if (isImageLoaded && pendingDamageEffect) {
            triggerDamageEffect();
            setPendingDamageEffect(false);
        }
    }, [isImageLoaded, pendingDamageEffect]);

    const triggerDamageEffect = () => {
        setShowDamageEffect(true);
        setTimeout(() => setShowDamageEffect(false), 1000); // Reset after animation
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ffd700', '#ffaa00', '#ffffff', '#dc3545']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ffd700', '#ffaa00', '#ffffff', '#dc3545']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const fetchMe = async () => {
        try {
            const res = await api.get('/api/v1/users/me');
            setMyNickname(res.data.nickname);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyGuildAndBoss = async () => {
        try {
            const guildRes = await api.get('/api/v1/guilds/me');
            if (guildRes.data) {
                setGuild(guildRes.data);
                if (guildRes.data.currentBossId) {
                    const bossRes = await api.get(`/api/v1/bosses/${guildRes.data.currentBossId}`);
                    setBoss(bossRes.data);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartRaid = async () => {
        if (!guild) return;

        openConfirm({
            title: '레이드 시작',
            message: '새로운 보스 레이드를 시작하시겠습니까?\n이전 보스 기록은 초기화됩니다.',
            onConfirm: async () => {
                try {
                    await api.post(`/api/v1/guilds/${guild.id}/raid/start`);
                    openModal({ title: '성공', message: '레이드가 시작되었습니다!' });
                    fetchMyGuildAndBoss(); // Refresh
                } catch (err: any) {
                    openModal({ title: '오류', message: err.response?.data?.message || '레이드 시작 실패', type: 'error' });
                }
            }
        });
    };

    if (isLoading) return <div className={styles.container}>로딩 중...</div>;

    if (!guild) {
        return (
            <div className={styles.container} style={{ textAlign: 'center', marginTop: '4rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
                    길드에 가입해야 보스 레이드에 참여할 수 있습니다.
                </p>
                <button
                    className={styles.submitButton}
                    onClick={() => router.push('/guilds')}
                    style={{ width: 'auto', padding: '0.8rem 2rem' }}
                >
                    길드 찾으러 가기
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>

            {!boss ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ marginBottom: '1rem', color: '#333' }}>진행 중인 레이드가 없습니다.</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        새로운 보스를 소환하여 길드원들과 함께 공략해보세요!
                    </p>
                    <button
                        className={styles.submitButton}
                        onClick={handleStartRaid}
                        style={{ width: 'auto', padding: '0.8rem 2rem', backgroundColor: '#dc3545' }}
                    >
                        레이드 시작하기
                    </button>
                </div>
            ) : (
                <div className={styles.bossContainer}>
                    <div className={`${styles.imageWrapper} ${showDamageEffect ? styles.shake : ''}`}>
                        <img
                            src={boss.imageUrl || '/images/default-boss.png'}
                            alt={boss.name}
                            className={`${styles.bossImage} ${!boss.isActive ? styles.defeated : ''}`}
                            onLoad={() => setIsImageLoaded(true)}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Boss';
                            }}
                        />

                        {/* Damage Effects */}
                        {showDamageEffect && (
                            <div className={`${styles.flashOverlay} ${styles.flash}`} />
                        )}

                        {!boss.isActive && (
                            <div className={styles.overlay}>
                                토벌 성공!
                            </div>
                        )}
                        <div className={styles.hpSection}>
                            <div className={styles.hpBarContainer}>
                                <div
                                    className={styles.hpBarFill}
                                    style={{
                                        width: `${(boss.currentHp / boss.maxHp) * 100}%`,
                                        backgroundColor: boss.isActive ? '#28a745' : '#dc3545'
                                    }}
                                />
                            </div>
                            <div className={styles.hpText}>
                                {boss.currentHp.toLocaleString()} / {boss.maxHp.toLocaleString()} HP
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoContainer}>
                        <div className={styles.headerRow}>
                            <span className={styles.bossLevel}>Lv. {boss.level}</span>
                            <h2 className={styles.bossName}>{boss.name}</h2>
                        </div>

                        <p className={styles.description}>{boss.description}</p>


                        {!boss.isActive && (
                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <button
                                    className={styles.submitButton}
                                    onClick={handleStartRaid}
                                >
                                    새로운 보스 소환하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
