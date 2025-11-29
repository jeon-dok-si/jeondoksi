'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/molecules/Card';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/v1/auth/login', formData);
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || '로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <h1 className={styles.title}>로그인</h1>
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
                        label="비밀번호"
                        name="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <Button type="submit" isLoading={isLoading} className={styles.submitButton}>
                        로그인
                    </Button>
                </form>
                <p className={styles.footer}>
                    계정이 없으신가요? <Link href="/signup" className={styles.link}>회원가입</Link>
                </p>
            </Card>
        </div>
    );
}
