import { createContext, useState, useEffect, useCallback } from "react";

// creates the context object — components call useContext(UserAvatarContext) to read from it
export const UserAvatarContext = createContext({ avatar: '', refreshAvatar: () => {}, isBanned: false });

// the provider wraps the app and holds the actual avatar state
export const UserAvatarProvider = ({ children }) => {
    const [avatar, setAvatar] = useState('');
    const [isBanned, setIsBanned] = useState(localStorage.getItem("isBanned") === "true");

    const fetchUserData = useCallback(() => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
            setAvatar('');
            setIsBanned(false);
            return;
        }
        fetch("http://localhost:3001/api/users/" + currentUserId)
            .then(res => res.json())
            .then(data => {
                setAvatar(data.avatar || '');
                const banned = data.isBanned || false;
                setIsBanned(banned);
                localStorage.setItem("isBanned", banned ? "true" : "false");
            })
            .catch(() => {});
    }, []);

    // reads userId fresh from localStorage every call, so it always uses the currently logged-in user
    const refreshAvatar = useCallback(() => {
        fetchUserData();
    }, [fetchUserData]);

    // load on mount and poll every 5 seconds to detect admin-driven changes (e.g. ban/unban)
    useEffect(() => {
        fetchUserData();
        const interval = setInterval(fetchUserData, 5000);
        return () => clearInterval(interval);
    }, [fetchUserData]);

    // value is what consuming components get when they call useContext(UserAvatarContext)
    return (
        <UserAvatarContext.Provider value={{ avatar, refreshAvatar, isBanned }}>
            {children}
        </UserAvatarContext.Provider>
    );
};
