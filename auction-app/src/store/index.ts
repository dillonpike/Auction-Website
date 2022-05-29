import create from 'zustand';

interface UserState {
    loggedInUser: User[];
    token: string;
    setLoggedInUser: (users: Array<User>) => void;
    editLoggedInUser: (user: User, newUsername: string) => void;
    removeLoggedInUser: (user: User) => void;
}

const getLocalStorage = (key: string): Array<User> =>
    JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorage = (key: string, value:Array<User>) =>
    window.localStorage.setItem(key, JSON.stringify(value));

// const useStore = create<UserState>((set) => ({
//     users: getLocalStorage('users') || [],
//     setUsers: (users: Array<User>) => set(() => {
//         setLocalStorage('users', users)
//         return {users: users}
//     }),
//     editUser: (user: User, newUsername) => set((state) => {
//         const temp = state.users.map(u => u.user_id === user.user_id ?
//             ({...u, username: newUsername} as User): u)
//         setLocalStorage('users', temp)
//         return {users: temp}
//     }),
//     removeUser: (user: User) => set((state) => {
//         setLocalStorage('users', state.users.filter(u => u.user_id !==
//             user.user_id))
//         return {users: state.users.filter(u => u.user_id !==
//                 user.user_id)}
//     })
// }))

// export const useUserStore = useStore;