'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Character } from '@/types';
import styles from './GachaReveal.module.css';
import { Button } from '@/components/atoms/Button';

interface GachaRevealProps {
    character: Character;
    onClose: () => void;
}

export const GachaReveal: React.FC<GachaRevealProps> = ({ character, onClose }) => {
    const [step, setStep] = useState<'chest' | 'opening' | 'revealed'>('chest');

    useEffect(() => {
        if (step === 'chest') {
            // Automatically start opening after a short delay
            const timer = setTimeout(() => setStep('opening'), 500);
            return () => clearTimeout(timer);
        }
        if (step === 'opening') {
            // Simulate opening animation time
            const timer = setTimeout(() => {
                setStep('revealed');
                triggerConfetti(character.rarity);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, character.rarity]);

    const triggerConfetti = (rarity: string) => {
        const colors = getRarityColors(rarity);
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    };

    const getRarityColors = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return ['#b0b0b0', '#ffffff'];
            case 'RARE': return ['#4287f5', '#42e3f5'];
            case 'EPIC': return ['#9b42f5', '#d442f5'];
            case 'UNIQUE': return ['#ffd700', '#ffaa00', '#ffffff'];
            default: return ['#ffffff'];
        }
    };

    return (
        <div className={styles.overlay}>
            <AnimatePresence mode="wait">
                {step === 'chest' && (
                    <motion.div
                        key="chest"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={styles.chestContainer}
                    >
                        <div className={styles.chest}>📦</div>
                        <p className={styles.message}>소환 중...</p>
                    </motion.div>
                )}

                {step === 'opening' && (
                    <motion.div
                        key="opening"
                        className={styles.chestContainer}
                        animate={{
                            x: [-5, 5, -5, 5, 0],
                            rotate: [-2, 2, -2, 2, 0],
                            scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    >
                        <div className={`${styles.chest} ${styles.glowing}`}>📦</div>
                        <p className={styles.message}>두근두근!</p>
                    </motion.div>
                )}

                {step === 'revealed' && (
                    <motion.div
                        key="revealed"
                        initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className={styles.cardContainer}
                    >
                        <div className={`${styles.card} ${styles[character.rarity.toLowerCase()]}`}>
                            <div className={styles.glowEffect} />
                            <div className={styles.cardHeader}>
                                <span className={styles.rarityBadge}>{character.rarity}</span>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src={character.imageUrl} alt={character.name} className={styles.characterImage} />
                            </div>
                            <div className={styles.cardBody}>
                                <h2 className={styles.characterName}>{character.name}</h2>
                                <div className={styles.stats}>
                                    <span>Lv. {character.level}</span>
                                </div>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Button onClick={onClose} size="lg" className={styles.confirmButton}>
                                확인
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
