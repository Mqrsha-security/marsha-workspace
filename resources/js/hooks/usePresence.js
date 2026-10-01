import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export function usePresence() {
    const { auth, team_presence = [] } = usePage().props;
    const [presenceList, setPresenceList] = useState(team_presence);

    const currentUser = auth?.user;
    const isCurrentAdit = Boolean(currentUser?.email?.includes('adit'));
    const isCurrentRisti = Boolean(currentUser?.email?.includes('risti'));

    const pingServer = async () => {
        try {
            const res = await axios.post('/presence/ping');
            if (res.data?.users) {
                setPresenceList(res.data.users);
            }
        } catch (e) {
            // Ignore background network blips
        }
    };

    useEffect(() => {
        // Ping on mount
        pingServer();

        // 20 second heartbeat
        const timer = setInterval(() => {
            pingServer();
        }, 20000);

        // Visibility change listener
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                pingServer();
            }
        };

        // Tab close / unload beacon
        const handleBeforeUnload = () => {
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon('/presence/offline');
                }
            } catch (err) {}
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handleBeforeUnload);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handleBeforeUnload);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const aditUser = presenceList.find(
        (u) => u.email?.includes('adit') || u.name?.toLowerCase().includes('adit')
    );
    const ristiUser = presenceList.find(
        (u) => u.email?.includes('risti') || u.name?.toLowerCase().includes('risti')
    );

    const isAditActive = isCurrentAdit || Boolean(aditUser?.is_active);
    const isRistyActive = isCurrentRisti || Boolean(ristiUser?.is_active);

    return {
        presenceList,
        isAditActive,
        isRistyActive,
        currentUser,
    };
}
