'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Guild, GuildMember } from '@/types';
import styles from '../guilds.module.css';
import { useModal } from '@/contexts/ModalContext';

export default function GuildDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { openModal, openConfirm } = useModal();
    const guildId = params.id;
    const [guild, setGuild] = useState<Guild | null>(null);
    const [members, setMembers] = useState<GuildMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [myNickname, setMyNickname] = useState('');

    useEffect(() => {
        if (guildId) {
            fetchGuildDetail();
            fetchGuildMembers();
            fetchMe();
        }
    }, [guildId]);

    const fetchMe = async () => {
        try {
            const res = await api.get('/api/v1/users/me');
            setMyNickname(res.data.nickname);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchGuildDetail = async () => {
        try {
            const res = await api.get(`/api/v1/guilds/${guildId}`);
            setGuild(res.data);
        } catch (err) {
            console.error(err);
            openModal({ title: '오류', message: '길드 정보를 불러오는데 실패했습니다.', type: 'error' });
            router.push('/guilds');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGuildMembers = async () => {
        try {
            const res = await api.get(`/api/v1/guilds/${guildId}/members`);
            setMembers(res.data);
        } catch (err) {
            console.error(err);
        }
    };



    const handleLeave = async () => {
        openConfirm({
            title: '길드 탈퇴',
            message: '정말 길드를 탈퇴하시겠습니까?',
            onConfirm: async () => {
                try {
                    await api.post(`/api/v1/guilds/${guildId}/leave`);
                    openModal({ title: '성공', message: '길드를 탈퇴했습니다.' });
                    router.push('/guilds');
                } catch (err: any) {
                    openModal({ title: '오류', message: err.response?.data?.message || '탈퇴 실패', type: 'error' });
                }
            }
        });
    };

    const handleStartRaid = async () => {
        openConfirm({
            title: '레이드 시작',
            message: '새로운 보스 레이드를 시작하시겠습니까?\n이전 보스 기록은 초기화됩니다.',
            onConfirm: async () => {
                try {
                    await api.post(`/api/v1/guilds/${guildId}/raid/start`);
                    openModal({ title: '성공', message: '레이드가 시작되었습니다!' });
                    fetchGuildDetail(); // Refresh to get currentBossId
                } catch (err: any) {
                    openModal({ title: '오류', message: err.response?.data?.message || '레이드 시작 실패', type: 'error' });
                }
            }
        });
    };

    if (isLoading || !guild) return <div className={styles.container}>로딩 중...</div>;

    const isLeader = guild.leaderName === myNickname;

    return (
        <div className={styles.container}>
            <div className={styles.card} style={{ cursor: 'default', transform: 'none' }}>
                <div className={styles.cardHeader}>
                    <h1 className={styles.title}>{guild.name}</h1>
                    <span className={`${styles.badge} ${guild.isPrivate ? styles.badgePrivate : styles.badgePublic}`}>
                        {guild.isPrivate ? '비공개' : '공개'}
                    </span>
                </div>

                <div style={{ margin: '2rem 0' }}>
                    <h3 className={styles.label}>길드 소개</h3>
                    <p style={{ lineHeight: 1.6, color: '#555' }}>
                        {guild.description || '소개글이 없습니다.'}
                    </p>
                </div>

                {/* Raid Status Section */}
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #cce5ff' }}>
                    <h3 className={styles.label} style={{ marginBottom: '1rem' }}>보스 레이드</h3>
                    {guild.currentBossId ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#004085', fontWeight: 'bold' }}>현재 진행 중인 레이드가 있습니다!</span>
                            <button
                                className={styles.submitButton}
                                onClick={() => router.push('/boss-raid')}
                                style={{ width: 'auto', padding: '0.5rem 1.5rem', flex: 'none' }}
                            >
                                레이드 입장
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>진행 중인 레이드가 없습니다.</span>
                            <button
                                className={styles.submitButton}
                                onClick={handleStartRaid}
                                style={{ width: 'auto', padding: '0.5rem 1.5rem', backgroundColor: '#dc3545', flex: 'none' }}
                            >
                                레이드 시작
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <div className={styles.statItem}>
                        <span className={styles.label}>길드장</span>
                        <span>{guild.leaderName}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.label}>인원</span>
                        <span>{guild.currentMemberCount} / {guild.maxMembers}</span>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 className={styles.label}>길드원 목록</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginTop: '1rem'
                    }}>
                        {members.map(member => (
                            <div key={member.userId} style={{
                                padding: '1rem',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #eee',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{ fontWeight: 'bold' }}>{member.nickname}</span>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: member.role === 'LEADER' ? '#ffd700' : member.role === 'OFFICER' ? '#c0c0c0' : '#e0e0e0',
                                    color: '#333'
                                }}>
                                    {member.role === 'LEADER' ? '길드장' : member.role === 'OFFICER' ? '운영진' : '길드원'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    {/* Invite Button */}
                    <button
                        className={styles.submitButton}
                        onClick={() => {
                            if (guild.joinCode) {
                                openModal({ title: '초대 코드', message: `친구에게 이 코드를 공유하세요:\n\n${guild.joinCode}` });
                            } else {
                                openModal({ title: '알림', message: '초대 코드가 없는 길드입니다.' });
                            }
                        }}
                    >
                        초대하기
                    </button>

                    {/* Leave Button */}
                    <button
                        className={styles.cancelButton}
                        onClick={handleLeave}
                        style={{ color: '#dc3545', borderColor: '#dc3545' }}
                    >
                        탈퇴하기
                    </button>
                </div>
            </div>


        </div>
    );
}
