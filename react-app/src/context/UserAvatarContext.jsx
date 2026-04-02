import { createContext, useState, useEffect, useCallback } from "react";

// creates the context object — components call useContext(UserAvatarContext) to read from it
export const UserAvatarContext = createContext({ avatar: '', refreshAvatar: () => {} });

// the provider wraps the app and holds the actual avatar state
export const UserAvatarProvider = ({ children }) => {
    const [avatar, setAvatar] = useState('');

    // reads userId fresh from localStorage every call, so it always uses the currently logged-in user
    const refreshAvatar = useCallback(() => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) {
            setAvatar('');
            return;
        }
        fetch("http://localhost:3001/api/users/" + currentUserId)
            .then(res => res.json())
            .then(data => setAvatar(data.avatar || ''));
    }, []);

    // load avatar on mount by fetching directly — avoids calling setState via refreshAvatar inside an effect
    useEffect(() => {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) return;
        fetch("http://localhost:3001/api/users/" + currentUserId)
            .then(res => res.json())
            .then(data => setAvatar(data.avatar || ''));
    }, []);

    // value is what consuming components get when they call useContext(UserAvatarContext)
    return (
        <UserAvatarContext.Provider value={{ avatar, refreshAvatar }}>
            {children}
        </UserAvatarContext.Provider>
    );
};
