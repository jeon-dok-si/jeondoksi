'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Book } from '@/types';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import styles from './page.module.css';

import { useModal } from '@/contexts/ModalContext';

export default function SearchPage() {
    const router = useRouter();
    const { openModal } = useModal();
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setHasSearched(true);
        try {
            const res = await api.get(`/api/v1/books/search?query=${query}`);
            setBooks(res.data.data);
        } catch (err) {
            console.error(err);
            openModal({
                title: '검색 실패',
                message: '검색 중 오류가 발생했습니다.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectBook = (book: Book) => {
        const params = new URLSearchParams({
            isbn: book.isbn,
            title: book.title,
            thumbnail: book.thumbnail,
            author: book.author,
        });
        router.push(`/report?${params.toString()}`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>독서 기록하기</h1>

            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="책 제목을 입력하세요"
                        className={styles.searchInput}
                    />
                    <Button type="submit" className={styles.searchButton} disabled={isLoading}>
                        {isLoading ? '검색 중...' : '검색'}
                    </Button>
                </div>
            </form>

            {isLoading ? (
                <div className={styles.loading}>책을 찾고 있습니다... 📚</div>
            ) : (
                <div className={styles.grid}>
                    {books.map((book) => (
                        <div key={book.isbn} className={styles.bookCard} onClick={() => handleSelectBook(book)}>
                            <img src={book.thumbnail} alt={book.title} className={styles.thumbnail} />
                            <div className={styles.bookContent}>
                                <h3 className={styles.bookTitle}>{book.title}</h3>
                                <p className={styles.bookAuthor}>{book.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && hasSearched && books.length === 0 && (
                <div className={styles.emptyState}>
                    검색 결과가 없습니다. <br /> 다른 검색어로 시도해보세요.
                </div>
            )}

            {!hasSearched && (
                <div className={styles.initialState}>
                    <p>읽은 책을 검색하여 독후감을 작성해보세요!</p>
                    <p className={styles.subText}>독후감을 쓰면 경험치와 포인트를 얻을 수 있습니다.</p>
                </div>
            )}
        </div>
    );
}
