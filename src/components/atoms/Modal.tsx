'use client';

import React from 'react';
import styles from './Modal.module.css';
import { FaCheck, FaExclamation, FaInfo } from 'react-icons/fa';

export type ModalType = 'success' | 'error' | 'info';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: ModalType;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const Modal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = '확인',
    cancelText = '취소'
}: ModalProps) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheck />;
            case 'error': return <FaExclamation />;
            default: return <FaInfo />;
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={`${styles.iconWrapper} ${styles[type]}`}>
                    {getIcon()}
                </div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>

                {onConfirm ? (
                    <div className={styles.buttonGroup}>
                        <button className={`${styles.button} ${styles.cancel}`} onClick={onClose}>
                            {cancelText}
                        </button>
                        <button className={`${styles.button} ${styles[type]}`} onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </div>
                ) : (
                    <button className={`${styles.button} ${styles[type]}`} onClick={onClose}>
                        {confirmText}
                    </button>
                )}
            </div>
        </div>
    );
};
