import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { User } from '@/types';

export function useAuth(requireAuth = true) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            if (requireAuth) router.push('/login');
            setIsLoading(false);
            return;
        }

        api.get('/api/v1/users/me')
            .then((res) => {
                setUser(res.data.data);
            })
            .catch(() => {
                localStorage.removeItem('accessToken');
                if (requireAuth) router.push('/login');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [router, requireAuth]);

    return { user, isLoading };
}
