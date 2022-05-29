import create from 'zustand';

interface UserState {
    userId: number;
    setUserId: (userId: number) => void;
}

const getLocalStorage = (key: string): number =>
    JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorage = (key: string, value:number) =>
    window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<UserState>((set) => ({
    userId: getLocalStorage('userId') || -1,

    setUserId: (userId: number) => set(() => {
        setLocalStorage('userId', userId)
        return {userId: userId}
    }),
    // setUsers: (users: Array<User>) => set(() => {
    //     setLocalStorage('users', users)
    //     return {users: users}
    // }),
    // editUser: (user: User, newUsername) => set((state) => {
    //     const temp = state.users.map(u => u.user_id === user.user_id ?
    //         ({...u, username: newUsername} as User): u)
    //     setLocalStorage('users', temp)
    //     return {users: temp}
    // }),
    // removeUser: (user: User) => set((state) => {
    //     setLocalStorage('users', state.users.filter(u => u.user_id !==
    //         user.user_id))
    //     return {users: state.users.filter(u => u.user_id !==
    //             user.user_id)}
    // })
}))

export const useUserStore = useStore;