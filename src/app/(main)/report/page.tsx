'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { ReportSubmissionResponse } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

function ReportEditor() {
    const router = useRouter();
    const { openModal, openConfirm } = useModal();
    const searchParams = useSearchParams();
    const isbn = searchParams.get('isbn');
    const title = searchParams.get('title');
    const thumbnail = searchParams.get('thumbnail');
    const author = searchParams.get('author');

    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [reportResult, setReportResult] = useState<ReportSubmissionResponse | null>(null);

    useEffect(() => {
        if (!isbn) {
            openModal({
                title: '잘못된 접근',
                message: '잘못된 접근입니다.',
                type: 'error'
            });
            router.push('/search');
        }
    }, [isbn, router, openModal]);

    const handleSubmit = async () => {
        const lengthWithoutSpaces = content.replace(/\s/g, '').length;
        if (lengthWithoutSpaces < 50) {
            openModal({
                title: '작성 분량 부족',
                message: `독후감은 공백 제외 50자 이상 작성해야 합니다.\n(현재: ${lengthWithoutSpaces}자)`,
                type: 'info'
            });
            return;
        }

        openConfirm({
            title: '제출 확인',
            message: '독후감을 제출하시겠습니까?',
            type: 'info',
            onConfirm: async () => {
                setIsLoading(true);
                try {
                    const res = await api.post('/api/v1/reports', {
                        isbn,
                        title,
                        content,
                    });
                    setReportResult(res.data.data);
                    setShowResult(true);
                } catch (err: any) {
                    console.error(err);
                    openModal({
                        title: '제출 실패',
                        message: err.response?.data?.message || '제출 중 오류가 발생했습니다.',
                        type: 'error'
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    if (showResult && reportResult) {
        return (
            <div className={styles.resultContainer}>
                <Card className={styles.resultCard}>
                    <h2 className={styles.resultTitle}>🎉 제출 완료!</h2>
                    <div className={styles.resultBookInfo}>
                        <img
                            src={reportResult.book.thumbnail}
                            alt={reportResult.book.title}
                            className={styles.resultThumbnail}
                        />
                        <div>
                            <h3 className={styles.resultBookTitle}>{reportResult.book.title}</h3>
                            <p className={styles.resultBookAuthor}>{reportResult.book.author}</p>
                        </div>
                    </div>

                    <div className={styles.analysisResult}>
                        <div className={styles.typeTag}>
                            {reportResult.analysisResult.typeName}
                        </div>
                        <div className={styles.scores}>
                            <div className={styles.scoreItem}>
                                <span>논리</span>
                                <span>{reportResult.analysisResult.scores.logic}</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span>감성</span>
                                <span>{reportResult.analysisResult.scores.emotion}</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span>행동</span>
                                <span>{reportResult.analysisResult.scores.action}</span>
                            </div>
                        </div>
                        <div className={styles.feedbackBox}>
                            <h4>AI 피드백</h4>
                            <p>{reportResult.analysisResult.feedback}</p>
                        </div>
                    </div>

                    <p className={styles.resultDesc}>
                        경험치와 포인트를 획득했습니다!
                    </p>
                    <div className={styles.reward}>
                        <span>✨ +50 XP</span>
                    </div>
                    <Button
                        onClick={() => router.push(`/quiz/${isbn}`)}
                        className={styles.quizButton}
                        size="lg"
                    >
                        퀴즈 풀러 가기
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className={styles.homeButton}
                    >
                        홈으로
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        <div className={styles.spinner}>🔮</div>
                        <h2 className={styles.loadingTitle}>AI가 독후감을 분석하고 있습니다...</h2>
                        <p className={styles.loadingDesc}>잠시만 기다려주세요.</p>
                    </div>
                </div>
            )}

            <div className={styles.bookInfoSection}>
                <div className={styles.bookCard}>
                    {thumbnail && <img src={thumbnail} alt={title || ''} className={styles.thumbnail} />}
                    <h1 className={styles.bookTitle}>{title}</h1>
                    <p className={styles.bookAuthor}>{author}</p>
                    <p className={styles.contextLabel}>이 책에 대한 독후감을 작성 중입니다</p>
                </div>
            </div>

            <div className={styles.editorSection}>
                <div className={styles.editorCard}>
                    <textarea
                        className={styles.textarea}
                        placeholder="이 책을 읽고 느낀 점을 자유롭게 작성해주세요. (공백 제외 50자 이상)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <div className={styles.footer}>
                        <span className={styles.counter}>
                            {content.replace(/\s/g, '').length} / 50자
                        </span>
                        <Button
                            onClick={handleSubmit}
                            disabled={content.replace(/\s/g, '').length < 50 || isLoading}
                        >
                            제출하기
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReportEditor />
        </Suspense>
    );
}
