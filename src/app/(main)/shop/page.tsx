'use client';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { Character } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { GachaReveal } from '@/components/molecules/GachaReveal';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

export default function ShopPage() {
    const { openModal, openConfirm } = useModal();
    const [gachaResult, setGachaResult] = useState<Character | null>(null);
    const [isGachaLoading, setIsGachaLoading] = useState(false);
    const [showGachaReveal, setShowGachaReveal] = useState(false);
    const [userPoint, setUserPoint] = useState<number>(0);

    React.useEffect(() => {
        fetchUserPoint();
    }, []);

    const fetchUserPoint = async () => {
        try {
            const res = await api.get('/api/v1/users/me');
            setUserPoint(res.data.data.point);
        } catch (err) {
            console.error('Failed to fetch user point', err);
        }
    };

    const handleGacha = async () => {
        if (userPoint < 100) {
            openModal({
                title: '포인트 부족',
                message: '소환을 위한 포인트가 부족합니다. (필요: 100 P)',
                type: 'error'
            });
            return;
        }

        openConfirm({
            title: '캐릭터 소환',
            message: '100 포인트를 사용하여 새로운 동료를 소환하시겠습니까?',
            type: 'info',
            onConfirm: async () => {
                setIsGachaLoading(true);
                setShowGachaReveal(true);
                setGachaResult(null);

                try {
                    const res = await api.post('/api/v1/characters/draw');
                    // Delay setting the result slightly to allow the chest animation to start
                    setTimeout(() => {
                        setGachaResult(res.data.data);
                        fetchUserPoint(); // Refresh points after draw
                    }, 1000);
                } catch (err: any) {
                    openModal({
                        title: '소환 실패',
                        message: err.response?.data?.message || '소환 중 오류가 발생했습니다.',
                        type: 'error'
                    });
                    setShowGachaReveal(false);
                } finally {
                    setIsGachaLoading(false);
                }
            }
        });
    };

    const handleCloseReveal = () => {
        setShowGachaReveal(false);
        setGachaResult(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <h1 className={styles.title}>신비한 소환소</h1>
                <p className={styles.subtitle}>
                    운명의 동료가 당신을 기다리고 있습니다.<br />
                    강력한 힘을 가진 캐릭터를 소환해보세요!
                </p>

                <div className={styles.summonCircle}>
                    <div className={styles.circleInner}>
                        <div className={styles.chestIcon}>🎁</div>
                    </div>
                </div>

                <div className={styles.actionArea}>
                    <div className={styles.priceTag}>
                        <span className={styles.priceLabel}>소환 비용</span>
                        <span className={styles.priceValue}>100 P</span>
                        <span className={styles.currentPoint}>(보유: {userPoint.toLocaleString()} P)</span>
                    </div>
                    <Button onClick={handleGacha} size="lg" className={styles.summonButton}>
                        1회 소환하기
                    </Button>
                </div>
            </div>

            {showGachaReveal && gachaResult && (
                <GachaReveal
                    character={gachaResult}
                    onClose={handleCloseReveal}
                />
            )}
        </div>
    );
}
