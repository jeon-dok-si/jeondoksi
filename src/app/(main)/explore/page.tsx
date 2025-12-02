'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import styles from './page.module.css';

interface AladinBook {
    title: string;
    author: string;
    cover: string;
    link: string;
    isbn: string;
    description: string;
    pubDate: string;
    categoryName: string;
    bestRank: number;
}

const CATEGORIES = [
    { id: 0, name: '종합' },
    { id: 1, name: '소설/시/희곡' },
    { id: 55889, name: '에세이' },
    { id: 656, name: '인문학' },
    { id: 798, name: '사회과학' },
    { id: 987, name: '과학' },
    { id: 336, name: '자기계발' },
    { id: 170, name: '경제경영' },
    { id: 74, name: '역사' },
];

export default function ExplorePage() {
    const [activeCategoryId, setActiveCategoryId] = useState(0);
    const [books, setBooks] = useState<AladinBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        // Reset when category changes
        setBooks([]);
        setPage(1);
        setHasMore(true);
        fetchBooks(1, activeCategoryId, true);
    }, [activeCategoryId]);

    const fetchBooks = async (pageNum: number, categoryId: number, isReset: boolean) => {
        setIsLoading(true);
        try {
            const url = categoryId === 0
                ? `/api/v1/books/bestsellers?page=${pageNum}`
                : `/api/v1/books/bestsellers/${categoryId}?page=${pageNum}`;
            const res = await api.get(url);
            const newBooks = res.data.data;

            if (newBooks.length === 0) {
                setHasMore(false);
            } else {
                setBooks(prev => isReset ? newBooks : [...prev, ...newBooks]);
            }
        } catch (err) {
            console.error('Failed to fetch bestsellers', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBooks(nextPage, activeCategoryId, false);
    };

    const handleBookClick = (link: string) => {
        window.open(link, '_blank');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>책 탐험하기</h1>
                <p className={styles.subtitle}>지금 가장 사랑받는 책들을 만나보세요.</p>
            </header>

            <nav className={styles.categoryNav}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`${styles.categoryButton} ${activeCategoryId === cat.id ? styles.active : ''}`}
                        onClick={() => setActiveCategoryId(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </nav>

            {isLoading && books.length === 0 ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}>📚</div>
                    <p>책을 불러오고 있습니다...</p>
                </div>
            ) : (
                <section className={styles.section}>
                    <div className={styles.bookGrid}>
                        {books.map((book, index) => (
                            <div
                                key={`${book.isbn}-${index}`}
                                className={styles.bookCard}
                                onClick={() => handleBookClick(book.link)}
                            >
                                <div className={styles.coverWrapper}>
                                    <img src={book.cover} alt={book.title} className={styles.coverImage} />
                                    <div className={`${styles.rankBadge} ${index < 3 && page === 1 ? (index === 0 ? styles.rank1 : index === 1 ? styles.rank2 : styles.rank3) : ''}`}>
                                        {index + 1}
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <h3 className={styles.bookTitle}>{book.title}</h3>
                                    <p className={styles.author}>{book.author}</p>
                                    <p className={styles.category}>{book.categoryName.split('>')[1] || book.categoryName}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className={styles.loadMoreContainer}>
                            <button
                                className={styles.loadMoreButton}
                                onClick={handleLoadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? '로딩 중...' : '더 보기'}
                            </button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
