'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Guild } from '@/types';
import styles from './guilds.module.css';
import { useModal } from '@/contexts/ModalContext';

export default function GuildsPage() {
    const router = useRouter();
    const { openModal } = useModal();
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
    const [showPrivateJoinModal, setShowPrivateJoinModal] = useState(false);
    const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null); // For Join Modal

    // Inputs
    const [newGuildName, setNewGuildName] = useState('');
    const [newGuildDesc, setNewGuildDesc] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        checkMyGuild();
    }, []);

    const checkMyGuild = async () => {
        try {
            // Check if user has a guild first
            const myGuildRes = await api.get('/api/v1/guilds/me');
            if (myGuildRes.data) {
                router.replace(`/guilds/${myGuildRes.data.id}`);
            } else {
                fetchGuilds();
            }
        } catch (err) {
            fetchGuilds();
        }
    };

    const fetchGuilds = async () => {
        try {
            const res = await api.get('/api/v1/guilds');
            setGuilds(res.data.content || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGuild = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/v1/guilds', {
                name: newGuildName,
                description: newGuildDesc,
                maxMembers: 30,
                isPrivate,
                password: null, // Removed password
                generateJoinCode: true
            });
            openModal({ title: '성공', message: '길드가 생성되었습니다!' });
            setShowCreateModal(false);
            checkMyGuild(); // Redirect to new guild
        } catch (err: any) {
            openModal({ title: '오류', message: err.response?.data?.message || '길드 생성 실패', type: 'error' });
        }
    };

    const handleJoinByCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/v1/guilds/join-by-code', { joinCode });
            openModal({ title: '성공', message: '길드에 가입되었습니다!' });
            setShowJoinCodeModal(false);
            router.push(`/guilds/${res.data.id}`);
        } catch (err: any) {
            openModal({ title: '오류', message: err.response?.data?.message || '가입 실패', type: 'error' });
        }
    };

    const handleGuildClick = (guild: Guild) => {
        setSelectedGuild(guild);
        setJoinCode(''); // Reset join code input
        setShowPrivateJoinModal(false); // Reset private modal state
    };

    const handleJoinSelectedGuild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGuild) return;

        // If private and not yet in private join modal flow
        if (selectedGuild.isPrivate && !showPrivateJoinModal) {
            setShowPrivateJoinModal(true);
            return;
        }

        try {
            await api.post(`/api/v1/guilds/${selectedGuild.id}/join`, {
                joinCode: selectedGuild.isPrivate ? joinCode : null
            });
            openModal({ title: '성공', message: '길드에 가입되었습니다!' });
            setSelectedGuild(null);
            setShowPrivateJoinModal(false);
            setJoinCode('');
            router.push(`/guilds/${selectedGuild.id}`);
        } catch (err: any) {
            openModal({ title: '오류', message: err.response?.data?.message || '가입 실패', type: 'error' });
        }
    };

    if (isLoading) return <div className={styles.container}>로딩 중...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>길드 목록</h1>
                <div className={styles.buttonGroup}>
                    <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
                        길드 만들기
                    </button>
                    <button className={styles.joinCodeButton} onClick={() => setShowJoinCodeModal(true)}>
                        코드로 가입
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {guilds.map(guild => (
                    <div key={guild.id} className={styles.card} onClick={() => handleGuildClick(guild)}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.guildName}>{guild.name}</h3>
                            <span className={`${styles.badge} ${guild.isPrivate ? styles.badgePrivate : styles.badgePublic}`}>
                                {guild.isPrivate ? '🔒 비공개' : '공개'}
                            </span>
                        </div>
                        <p className={styles.description}>{guild.description}</p>
                        <div className={styles.footer}>
                            <span>멤버 {guild.currentMemberCount}/{guild.maxMembers}</span>
                            <span>길드장: {guild.leaderName}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Guild Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>길드 생성</h2>
                        <form onSubmit={handleCreateGuild}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>길드 이름</label>
                                <input className={styles.input} value={newGuildName} onChange={e => setNewGuildName(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>소개</label>
                                <textarea className={styles.textarea} value={newGuildDesc} onChange={e => setNewGuildDesc(e.target.value)} />
                            </div>
                            <div className={styles.checkboxGroup}>
                                <input type="checkbox" id="private" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
                                <label htmlFor="private">비공개 길드 (목록에 노출되지 않으며, 코드로만 가입 가능)</label>
                            </div>
                            <div className={styles.buttonGroup}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>취소</button>
                                <button type="submit" className={styles.submitButton}>생성</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join By Code Modal */}
            {showJoinCodeModal && (
                <div className={styles.modalOverlay} onClick={() => setShowJoinCodeModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>코드로 가입</h2>
                        <form onSubmit={handleJoinByCode}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>초대 코드</label>
                                <input className={styles.input} value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowJoinCodeModal(false)}>취소</button>
                                <button type="submit" className={styles.submitButton}>가입</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Guild Preview Modal */}
            {selectedGuild && !showPrivateJoinModal && (
                <div className={styles.modalOverlay} onClick={() => setSelectedGuild(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{selectedGuild.name}</h2>
                        <span className={`${styles.badge} ${selectedGuild.isPrivate ? styles.badgePrivate : styles.badgePublic}`} style={{ marginBottom: '1rem', display: 'inline-block' }}>
                            {selectedGuild.isPrivate ? '🔒 비공개' : '공개'}
                        </span>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 className={styles.label}>길드 소개</h4>
                            <p style={{ color: '#555', lineHeight: 1.6 }}>{selectedGuild.description || '소개글이 없습니다.'}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                            <span>길드장: {selectedGuild.leaderName}</span>
                            <span>멤버: {selectedGuild.currentMemberCount} / {selectedGuild.maxMembers}</span>
                        </div>

                        <div className={styles.buttonGroup}>
                            <button type="button" className={styles.cancelButton} onClick={() => setSelectedGuild(null)}>닫기</button>
                            <button type="button" className={styles.submitButton} onClick={handleJoinSelectedGuild}>
                                {selectedGuild.isPrivate ? '가입 요청 (초대 코드 필요)' : '가입하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Private Guild Invite Code Modal */}
            {selectedGuild && showPrivateJoinModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPrivateJoinModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{selectedGuild.name} 가입</h2>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            비공개 길드입니다. 초대 코드를 입력해주세요.
                        </p>
                        <form onSubmit={handleJoinSelectedGuild}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>초대 코드</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={joinCode}
                                    onChange={e => setJoinCode(e.target.value)}
                                    placeholder="초대 코드 입력"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className={styles.buttonGroup}>
                                <button type="button" className={styles.cancelButton} onClick={() => setShowPrivateJoinModal(false)}>뒤로가기</button>
                                <button type="submit" className={styles.submitButton}>확인</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
