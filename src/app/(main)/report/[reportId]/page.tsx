'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Card } from '@/components/molecules/Card';
import { Button } from '@/components/atoms/Button';
import styles from './page.module.css';

interface ReportDetail {
    reportId: number;
    book: {
        isbn: string;
        title: string;
        author: string;
        thumbnail: string;
    };
    userContent: string;
    analysisResult: {
        type: string;
        typeName: string;
        scores: {
            logic: number;
            emotion: number;
            action: number;
        };
        feedback: string;
    };
    createdAt: string;
}

import { useModal } from '@/contexts/ModalContext';

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { openModal } = useModal();
    const { reportId } = params;
    const [report, setReport] = useState<ReportDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/api/v1/reports/${reportId}`);
                setReport(res.data.data);
            } catch (err) {
                console.error(err);
                openModal({
                    title: '오류 발생',
                    message: '독후감을 불러오는 중 오류가 발생했습니다.',
                    type: 'error'
                });
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        if (reportId) {
            fetchReport();
        }
    }, [reportId, router]);

    if (isLoading) {
        return <div className={styles.loading}>독후감을 불러오는 중... 📖</div>;
    }

    if (!report) {
        return null;
    }

    return (
        <div className={styles.container}>
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className={styles.backButton}
            >
                ← 뒤로 가기
            </Button>

            <Card className={styles.headerCard}>
                <img
                    src={report.book.thumbnail || '/images/no-image.png'}
                    alt={report.book.title}
                    className={styles.thumbnail}
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/120x174?text=No+Image';
                        e.currentTarget.onerror = null;
                    }}
                />
                <div className={styles.bookInfo}>
                    <h1 className={styles.bookTitle}>{report.book.title}</h1>
                    <p className={styles.bookAuthor}>{report.book.author}</p>
                    <span className={styles.date}>
                        작성일: {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <div className={styles.scores}>
                        <div className={styles.scoreItem}>
                            <span>논리</span>
                            <span>{report.analysisResult.scores.logic}</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span>감성</span>
                            <span>{report.analysisResult.scores.emotion}</span>
                        </div>
                        <div className={styles.scoreItem}>
                            <span>행동</span>
                            <span>{report.analysisResult.scores.action}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className={styles.contentCard}>
                <h2 className={styles.contentTitle}>독후감 내용</h2>
                <div className={styles.content}>
                    {report.userContent}
                </div>
            </Card>
        </div>
    );
}
