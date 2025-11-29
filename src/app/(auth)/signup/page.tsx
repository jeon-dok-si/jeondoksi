'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/molecules/Card';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

export default function SignupPage() {
    const router = useRouter();
    const { openModal } = useModal();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (formData.password.length < 8) {
            setError('비밀번호는 최소 8자 이상이어야 합니다.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/v1/auth/signup', {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
            });
            openModal({
                title: '회원가입 성공',
                message: '회원가입이 완료되었습니다! 로그인해주세요.',
                type: 'success'
            });
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h1 className={styles.title}>회원가입</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="이메일"
                        name="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="닉네임"
                        name="nickname"
                        placeholder="사용할 닉네임을 입력하세요"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="비밀번호"
                        name="password"
                        type="password"
                        placeholder="최소 8자 이상"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="비밀번호 확인"
                        name="confirmPassword"
                        type="password"
                        placeholder="비밀번호를 다시 입력하세요"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <Button type="submit" isLoading={isLoading} className={styles.submitButton}>
                        가입하기
                    </Button>
                </form>
                <p className={styles.footer}>
                    이미 계정이 있으신가요? <Link href="/login" className={styles.link}>로그인</Link>
                </p>
            </Card>
        </div>
    );
}
