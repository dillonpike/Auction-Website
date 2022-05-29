import create from 'zustand';

interface UserState {
    user: User;
    setUser: (user: User) => void;
}

const getLocalStorage = (key: string): User =>
    JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorage = (key: string, value: User) =>
    window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<UserState>((set) => ({
    user: getLocalStorage('user') || {userId: -1, firstName: "", lastName: "", email: ""},

    setUser: (user: User) => set(() => {
        setLocalStorage('user', user)
        return {user: user}
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