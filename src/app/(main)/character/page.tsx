'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { User, InventoryItem, Item } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import styles from './page.module.css';

type Tab = 'INVENTORY' | 'SHOP';
type Category = 'ALL' | 'HEAD' | 'FACE' | 'BODY';

import { useModal } from '@/contexts/ModalContext';

export default function CharacterPage() {
    const { openModal, openConfirm } = useModal();
    const [user, setUser] = useState<User | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('INVENTORY');
    const [activeCategory, setActiveCategory] = useState<Category>('ALL');
    const [isLoading, setIsLoading] = useState(true);

    // Gacha State
    const [gachaResult, setGachaResult] = useState<Item | null>(null);
    const [isGachaLoading, setIsGachaLoading] = useState(false);
    const [showGachaModal, setShowGachaModal] = useState(false);

    const fetchData = async () => {
        try {
            const [userRes, invenRes] = await Promise.all([
                api.get('/api/v1/users/me'),
                api.get('/api/v1/gamification/inventory'),
            ]);
            setUser(userRes.data.data);
            setInventory(invenRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEquip = async (invenId: number) => {
        try {
            await api.post(`/api/v1/gamification/inventory/${invenId}/equip`);
            fetchData(); // Refresh user and inventory to show equipped state
        } catch (err) {
            openModal({
                title: '오류 발생',
                message: '장착 중 오류가 발생했습니다.',
                type: 'error'
            });
        }
    };

    const handleGacha = async () => {
        if (!user || user.point < 100) {
            openModal({
                title: '포인트 부족',
                message: '포인트가 부족합니다.',
                type: 'error'
            });
            return;
        }
        openConfirm({
            title: '뽑기 확인',
            message: '100 포인트를 사용하여 뽑기를 진행하시겠습니까?',
            type: 'info',
            onConfirm: async () => {
                setIsGachaLoading(true);
                setShowGachaModal(true);

                try {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Animation delay
                    const res = await api.post('/api/v1/gamification/gacha');
                    setGachaResult(res.data.data);
                    fetchData(); // Refresh points and inventory
                } catch (err: any) {
                    openModal({
                        title: '오류 발생',
                        message: err.response?.data?.message || '뽑기 중 오류가 발생했습니다.',
                        type: 'error'
                    });
                    setShowGachaModal(false);
                } finally {
                    setIsGachaLoading(false);
                }
            }
        });
    };

    const filteredInventory = inventory.filter(item =>
        activeCategory === 'ALL' || item.category === activeCategory
    );

    if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
    if (!user) return null;

    return (
        <div className={styles.container}>
            {/* Character Preview Section */}
            <section className={styles.previewSection}>
                <div className={styles.characterContainer}>
                    {user.character?.bodyUrl && <img src={user.character.bodyUrl} alt="Body" className={styles.charLayer} />}
                    {user.character?.headUrl && <img src={user.character.headUrl} alt="Head" className={styles.charLayer} />}
                    {user.character?.faceUrl && <img src={user.character.faceUrl} alt="Face" className={styles.charLayer} />}
                    {!user.character?.bodyUrl && !user.character?.headUrl && !user.character?.faceUrl && (
                        <div className={styles.emptyChar}>?</div>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <h2 className={styles.nickname}>{user.nickname}</h2>
                    <div className={styles.points}>💰 {user.point} P</div>
                </div>
            </section>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'INVENTORY' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('INVENTORY')}
                >
                    인벤토리
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'SHOP' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('SHOP')}
                >
                    상점 (뽑기)
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.contentArea}>
                {activeTab === 'INVENTORY' && (
                    <>
                        <div className={styles.categoryFilter}>
                            {(['ALL', 'HEAD', 'FACE', 'BODY'] as Category[]).map(cat => (
                                <button
                                    key={cat}
                                    className={`${styles.catButton} ${activeCategory === cat ? styles.activeCat : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat === 'ALL' ? '전체' : cat}
                                </button>
                            ))}
                        </div>

                        <div className={styles.grid}>
                            {filteredInventory.map((item) => (
                                <Card key={item.invenId} className={`${styles.itemCard} ${styles[item.rarity.toLowerCase()]}`}>
                                    <div className={styles.itemImage}>
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                            />
                                        ) : (
                                            <div className={styles.noImage}>No Image</div>
                                        )}
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <p className={styles.itemName}>{item.name}</p>
                                        <span className={styles.itemRarity}>{item.rarity}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={item.isEquipped ? 'secondary' : 'primary'}
                                        onClick={() => handleEquip(item.invenId)}
                                        disabled={item.isEquipped}
                                        className={styles.equipButton}
                                    >
                                        {item.isEquipped ? '장착 중' : '장착'}
                                    </Button>
                                </Card>
                            ))}
                            {filteredInventory.length === 0 && (
                                <div className={styles.emptyState}>아이템이 없습니다.</div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'SHOP' && (
                    <div className={styles.shopContainer}>
                        <div className={styles.gachaBox}>
                            <div className={styles.boxImage}>🎁</div>
                            <h3 className={styles.gachaTitle}>랜덤 아이템 뽑기</h3>
                            <p className={styles.gachaDesc}>100 포인트를 사용하여<br />희귀한 아이템을 획득하세요!</p>
                            <Button onClick={handleGacha} size="lg" className={styles.gachaButton}>
                                1회 뽑기 (100 P)
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Gacha Modal */}
            {showGachaModal && (
                <div className={styles.modalOverlay}>
                    <Card className={styles.modalContent}>
                        {isGachaLoading ? (
                            <div className={styles.shakingBox}>📦</div>
                        ) : (
                            gachaResult && (
                                <div className={styles.resultContent}>
                                    <h2 className={styles.resultTitle}>축하합니다!</h2>
                                    <div className={`${styles.resultImage} ${styles[gachaResult.rarity.toLowerCase()]}`}>
                                        <img
                                            src={gachaResult.imageUrl}
                                            alt={gachaResult.name}
                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                        />
                                    </div>
                                    <p className={styles.resultName}>{gachaResult.name}</p>
                                    <p className={styles.resultRarity}>{gachaResult.rarity}</p>
                                    <Button onClick={() => setShowGachaModal(false)}>확인</Button>
                                </div>
                            )
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
