'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, ModalType } from '@/components/atoms/Modal';

interface ModalState {
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalType;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextType {
    openModal: (params: { title: string; message: string; type?: ModalType }) => void;
    openConfirm: (params: { title: string; message: string; onConfirm: () => void; type?: ModalType; confirmText?: string; cancelText?: string }) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
    });

    const openModal = ({ title, message, type = 'info' }: { title: string; message: string; type?: ModalType }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: undefined, // Ensure no confirm callback for standard modal
        });
    };

    const openConfirm = ({
        title,
        message,
        onConfirm,
        type = 'info',
        confirmText = '확인',
        cancelText = '취소'
    }: {
        title: string;
        message: string;
        onConfirm: () => void;
        type?: ModalType;
        confirmText?: string;
        cancelText?: string;
    }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: () => {
                onConfirm();
                closeModal();
            },
            confirmText,
            cancelText,
        });
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ openModal, openConfirm, closeModal }}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                onConfirm={modalState.onConfirm}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
