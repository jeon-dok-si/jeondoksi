'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { InventoryItem, Item } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

export default function ShopPage() {
    const { openModal, openConfirm } = useModal();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [gachaResult, setGachaResult] = useState<Item | null>(null);
    const [isGachaLoading, setIsGachaLoading] = useState(false);
    const [showGachaModal, setShowGachaModal] = useState(false);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/api/v1/gamification/inventory');
            setInventory(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleGacha = async () => {
        openConfirm({
            title: '뽑기 확인',
            message: '100 포인트를 사용하여 뽑기를 진행하시겠습니까?',
            type: 'info',
            onConfirm: async () => {
                setIsGachaLoading(true);
                setShowGachaModal(true);

                try {
                    // Simulate animation delay
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    const res = await api.post('/api/v1/gamification/gacha');
                    setGachaResult(res.data.data);
                    fetchInventory(); // Refresh inventory
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

    const handleEquip = async (invenId: number) => {
        try {
            await api.post(`/api/v1/gamification/inventory/${invenId}/equip`);
            // Optimistic update or refresh
            fetchInventory();
        } catch (err) {
            openModal({
                title: '오류 발생',
                message: '장착 중 오류가 발생했습니다.',
                type: 'error'
            });
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.gachaSection}>
                <h1 className={styles.title}>상점</h1>
                <div className={styles.gachaBox}>
                    <div className={styles.boxImage}>🎁</div>
                    <p className={styles.price}>1회 뽑기 - 100 P</p>
                    <Button onClick={handleGacha} size="lg" className={styles.gachaButton}>
                        뽑기
                    </Button>
                </div>
            </Card>

            <div className={styles.inventorySection}>
                <h2 className={styles.subtitle}>내 인벤토리</h2>
                {isLoading ? (
                    <div>로딩 중...</div>
                ) : (
                    <div className={styles.grid}>
                        {inventory.map((item) => (
                            <Card key={item.invenId} className={`${styles.itemCard} ${styles[item.rarity.toLowerCase()]}`}>
                                <div className={styles.itemImage}>
                                    {/* Placeholder for item image */}
                                    <img src={item.imageUrl} alt={item.name} />
                                </div>
                                <div className={styles.itemInfo}>
                                    <p className={styles.itemName}>{item.name}</p>
                                    <p className={styles.itemRarity}>{item.rarity}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant={item.isEquipped ? 'secondary' : 'primary'}
                                    onClick={() => handleEquip(item.invenId)}
                                    disabled={item.isEquipped}
                                    className={styles.equipButton}
                                >
                                    {item.isEquipped ? '장착 중' : '장착하기'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

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
                                        <img src={gachaResult.imageUrl} alt={gachaResult.name} />
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
