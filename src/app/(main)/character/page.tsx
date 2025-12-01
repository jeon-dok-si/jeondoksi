'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { User, Character } from '@/types';
import { Card } from '@/components/molecules/Card';
import { useModal } from '@/contexts/ModalContext';
import styles from './page.module.css';

export default function CharacterPage() {
    const [user, setUser] = useState<User | null>(null);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { openModal } = useModal();

    const fetchData = async () => {
        try {
            const [userRes, charRes] = await Promise.all([
                api.get('/api/v1/users/me'),
                api.get('/api/v1/characters'),
            ]);
            setUser(userRes.data.data);
            setCharacters(charRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEquip = async (characterId: number) => {
        try {
            await api.post(`/api/v1/characters/${characterId}/equip`);
            // Refresh data to show updated equipped status
            fetchData();
            openModal({
                title: '대표 캐릭터 설정 완료',
                message: '대표 캐릭터가 변경되었습니다.',
                type: 'success'
            });
        } catch (err: any) {
            console.error('Failed to equip character', err);
            openModal({
                title: '오류 발생',
                message: err.response?.data?.message || '대표 캐릭터 설정에 실패했습니다.',
                type: 'error'
            });
        }
    };

    if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
    if (!user) return null;

    // Fallback: If no character is equipped, use the first one as main
    const equippedCharacter = characters.find(c => c.isEquipped) || characters[0];

    return (
        <div className={styles.container}>
            {/* Main Character Dashboard */}
            {equippedCharacter && (
                <section className={styles.mainSection}>
                    <h3 className={styles.sectionTitle}>대표 캐릭터</h3>
                    <div className={styles.mainCharCard}>
                        <div className={styles.mainCharImage}>
                            <img src={equippedCharacter.imageUrl} alt={equippedCharacter.name} />
                        </div>
                        <div className={styles.mainCharInfo}>
                            <div className={styles.mainCharHeader}>
                                <span className={`${styles.itemRarity} ${styles[equippedCharacter.rarity.toLowerCase() + 'Text']}`}>
                                    {equippedCharacter.rarity}
                                </span>
                                <h2 className={styles.mainCharName}>{equippedCharacter.name}</h2>
                            </div>

                            <div className={styles.levelContainer}>
                                <div className={styles.levelLabel}>
                                    <span>Lv. {equippedCharacter.level}</span>
                                    <span>{equippedCharacter.currentXp} / {equippedCharacter.requiredXp} XP</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min((equippedCharacter.currentXp / equippedCharacter.requiredXp) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Character List Section */}
            <div className={styles.contentArea}>
                <h3 className={styles.sectionTitle}>다른 캐릭터</h3>
                <div className={styles.grid}>
                    {characters.filter(c => c.characterId !== equippedCharacter?.characterId).map((char) => (
                        <Card
                            key={char.characterId}
                            className={`${styles.itemCard} ${styles[char.rarity.toLowerCase()]}`}
                        >
                            <div className={styles.itemImage}>
                                <img
                                    src={char.imageUrl}
                                    alt={char.name}
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                            </div>
                            <div className={styles.itemInfo}>
                                <div className={styles.infoHeader}>
                                    <span className={`${styles.itemRarity} ${styles[char.rarity.toLowerCase() + 'Text']}`}>{char.rarity}</span>
                                    <span className={styles.levelInfo}>Lv. {char.level}</span>
                                </div>
                                <p className={styles.itemName}>{char.name}</p>

                                {/* Mini Progress Bar for Grid */}
                                <div className={styles.miniProgressBar}>
                                    <div
                                        className={styles.miniProgressFill}
                                        style={{ width: `${Math.min((char.currentXp / char.requiredXp) * 100, 100)}%` }}
                                    />
                                </div>

                                <button
                                    className={styles.equipButton}
                                    onClick={() => handleEquip(char.characterId)}
                                >
                                    대표 캐릭터 설정
                                </button>
                            </div>
                        </Card>
                    ))}
                    {characters.filter(c => c.characterId !== equippedCharacter?.characterId).length === 0 && (
                        <div className={styles.emptyState}>교체할 다른 캐릭터가 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
