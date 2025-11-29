'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Report } from '@/types';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

export default function LibraryPage() {
    const router = useRouter();
    const { openModal } = useModal();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/api/v1/reports/me');
                console.log('Reports data:', res.data.data); // Debugging log
                setReports(res.data.data);
            } catch (err) {
                console.error(err);
                openModal({
                    title: '오류 발생',
                    message: '독후감 목록을 불러오는 중 오류가 발생했습니다.',
                    type: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>서재를 정리하는 중... 📚</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>나의 서재</h1>
                <p className={styles.subtitle}>지금까지 작성한 독후감을 모아보세요.</p>
            </header>

            {reports.length > 0 ? (
                <div className={styles.grid}>
                    {reports.map((report) => (
                        <Card
                            key={report.reportId}
                            className={styles.reportCard}
                            onClick={() => router.push(`/report/${report.reportId}`)}
                        >
                            <div className={styles.thumbnailContainer}>
                                <img
                                    src={report.bookThumbnail || '/images/no-image.svg'}
                                    alt={report.bookTitle}
                                    className={styles.thumbnail}
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/no-image.svg';
                                        e.currentTarget.onerror = null;
                                    }}
                                />
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.bookTitle}>{report.bookTitle}</h3>
                                <div className={styles.meta}>
                                    <span className={styles.resultType}>{report.resultType}</span>
                                    <span className={styles.date}>{new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📚</span>
                    <p>아직 작성한 독후감이 없습니다.</p>
                    <Button
                        className={styles.writeButton}
                        onClick={() => router.push('/search')}
                    >
                        첫 독후감 쓰러 가기
                    </Button>
                </div>
            )}
        </div>
    );
}
