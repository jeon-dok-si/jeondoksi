'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Quiz, Question } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/molecules/Card';
import { Input } from '@/components/atoms/Input';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const { openModal } = useModal();
    const isbn = params.isbn;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<{ questionNo: number; answer: string; questionId?: number; question_id?: number }[]>([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        if (!isbn) return;
        api.get(`/api/v1/quizzes/${isbn}`)
            .then((res) => {
                console.log('Quiz API Response:', res.data);
                const quizData = res.data.data;

                // Fix: Parse optionsJson if options is missing (Backend API mismatch handling)
                if (quizData && quizData.questions) {
                    quizData.questions = quizData.questions.map((q: any) => {
                        if (!q.options && q.optionsJson) {
                            try {
                                q.options = JSON.parse(q.optionsJson);
                            } catch (e) {
                                console.error('Failed to parse optionsJson', e);
                                q.options = [];
                            }
                        }
                        return q;
                    });
                }

                setQuiz(quizData);
            })
            .catch((err) => {
                console.error(err);
                openModal({
                    title: '오류 발생',
                    message: '퀴즈를 불러오는 중 오류가 발생했습니다.',
                    type: 'error'
                });
                router.push('/');
            })
            .finally(() => setIsLoading(false));
    }, [isbn, router, openModal]);

    const handleNext = () => {
        if (!currentAnswer) return;

        const question = quiz!.questions[currentIdx];
        // Use questionId for submission as per actual API data structure (despite doc saying questionNo)
        const newAnswers = [...answers, { questionNo: question.questionNo, questionId: question.questionId, answer: currentAnswer }];
        setAnswers(newAnswers);
        setCurrentAnswer('');

        if (currentIdx < quiz!.questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers: any[]) => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/v1/quizzes/submit', {
                quizId: quiz!.quizId,
                answers: finalAnswers,
            });
            setResult(res.data.data);
        } catch (err: any) {
            openModal({
                title: '채점 실패',
                message: err.response?.data?.message || '채점 중 오류가 발생했습니다.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingOverlay}>
                <div className={styles.loadingContent}>
                    <div className={styles.spinner}>🧠</div>
                    <h2 className={styles.loadingTitle}>
                        {quiz ? '채점 중입니다...' : '퀴즈를 생성하고 있습니다...'}
                    </h2>
                    <p className={styles.loadingDesc}>
                        {quiz ? '잠시만 기다려주세요.' : 'AI가 당신만을 위한 문제를 만들고 있어요!'}
                    </p>
                </div>
            </div>
        );
    }
    if (!quiz) return null;

    if (result) {
        const isPassed = result.score >= 60;

        return (
            <div className={styles.resultContainer}>
                <Card className={styles.resultCard}>
                    <h2 className={styles.resultTitle}>
                        {isPassed ? '🎉 통과!' : '😢 아쉬워요!'}
                    </h2>
                    <div className={styles.scoreBox}>
                        <span className={styles.score}>{result.score}점</span>
                        <span className={styles.scoreLabel}>/ 100점</span>
                    </div>

                    {isPassed && (
                        <div className={styles.reward}>
                            <span>✨ +{result.gainedExp} XP</span>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <Button onClick={() => router.push('/')} className={styles.homeButton}>
                            홈으로
                        </Button>
                        {!isPassed && (
                            <Button variant="secondary" onClick={() => window.location.reload()}>
                                다시 풀기
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        );
    }

    const question = quiz.questions[currentIdx];
    if (!question) return null;

    console.log('Current Question Data:', question);

    const progress = ((currentIdx + 1) / quiz.questions.length) * 100;

    return (
        <div className={styles.container}>
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>

            <Card className={styles.questionCard}>
                <div className={styles.header}>
                    <span className={styles.questionNo}>Q{currentIdx + 1}.</span>
                    <span className={styles.typeBadge}>{question.type}</span>
                </div>
                <h3 className={styles.questionText}>{question.question}</h3>

                <div className={styles.options}>
                    {question.type === 'MULTIPLE' && (
                        <div className={styles.multipleGrid}>
                            {question.options && question.options.length > 0 ? (
                                question.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.optionButton} ${currentAnswer === opt ? styles.selected : ''}`}
                                        onClick={() => setCurrentAnswer(opt)}
                                    >
                                        {opt}
                                    </button>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'red', background: '#FFF5F5', borderRadius: '8px' }}>
                                    ⚠️ 보기가 없습니다. (API 응답 데이터 확인 필요)<br />
                                    <small>{JSON.stringify(question)}</small>
                                </div>
                            )}
                        </div>
                    )}

                    {question.type === 'OX' && (
                        <div className={styles.oxGrid}>
                            {['O', 'X'].map((opt) => (
                                <button
                                    key={opt}
                                    className={`${styles.oxButton} ${currentAnswer === opt ? styles.selected : ''}`}
                                    onClick={() => setCurrentAnswer(opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}

                    {question.type === 'SHORT' && (
                        <Input
                            placeholder="정답을 입력하세요"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            className={styles.shortInput}
                        />
                    )}
                </div>

                <Button
                    onClick={handleNext}
                    disabled={!currentAnswer}
                    className={styles.nextButton}
                    size="lg"
                >
                    {currentIdx === quiz.questions.length - 1 ? '제출하기' : '다음 문제'}
                </Button>
            </Card>
        </div>
    );
}
