import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
    return (
        <div className={clsx(styles.card, className)} onClick={onClick}>
            {children}
        </div>
    );
};
