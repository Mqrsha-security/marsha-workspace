import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export function usePresence() {
    const { auth, team_presence = [] } = usePage().props;
    const [presenceList, setPresenceList] = useState(team_presence);

    const currentUser = auth?.user;
    const isCurrentAdit = Boolean(currentUser?.email?.includes('adit'));
    const isCurrentRisti = Boolean(currentUser?.email?.includes('risti'));

    const pingServer = useCallback(async () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            return;
        }
        try {
            const res = await axios.post('/presence/ping', {
                user_id: currentUser?.id,
            });
            if (res.data?.users) {
                setPresenceList(res.data.users);
            }
        } catch (e) {
            // Ignore background network blips
        }
    }, [currentUser?.id]);

    const sendOffline = useCallback(() => {
        const userId = currentUser?.id;
        const url = `/presence/offline${userId ? `?user_id=${userId}` : ''}`;

        // 1. Modern fetch with keepalive (most reliable on mobile browsers)
        try {
            if (typeof window !== 'undefined' && window.fetch) {
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ user_id: userId }),
                    keepalive: true,
                }).catch(() => {});
            }
        } catch (e) {}

        // 2. Beacon fallback
        try {
            if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
                navigator.sendBeacon(url, JSON.stringify({ user_id: userId }));
            }
        } catch (e) {}
    }, [currentUser?.id]);

    useEffect(() => {
        // Initial ping on mount
        pingServer();

        // 6 second active heartbeat interval
        const timer = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                pingServer();
            }
        }, 6000);

        // Visibility change listener: when mobile browser minimizes, app switches, or screen locks
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                pingServer();
            } else if (document.visibilityState === 'hidden') {
                sendOffline();
            }
        };

        // Window unload / pagehide (tab close, browser quit)
        const handlePageHide = () => {
            sendOffline();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);
        window.addEventListener('beforeunload', handlePageHide);
        window.addEventListener('freeze', handlePageHide);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
            window.removeEventListener('beforeunload', handlePageHide);
            window.removeEventListener('freeze', handlePageHide);
        };
    }, [pingServer, sendOffline]);

    const aditUser = presenceList.find(
        (u) => u.email?.includes('adit') || u.name?.toLowerCase().includes('adit')
    );
    const ristiUser = presenceList.find(
        (u) => u.email?.includes('risti') || u.name?.toLowerCase().includes('risti')
    );

    const isDocActive = typeof document === 'undefined' || document.visibilityState === 'visible';

    const isAditActive = aditUser
        ? Boolean(aditUser.is_active)
        : (isCurrentAdit && isDocActive);

    const isRistyActive = ristiUser
        ? Boolean(ristiUser.is_active)
        : (isCurrentRisti && isDocActive);

    return {
        presenceList,
        isAditActive,
        isRistyActive,
        currentUser,
    };
}
