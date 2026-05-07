// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'
import { persist, createJSONStorage } from 'zustand/middleware'
import theme from '@/theme'

// const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
// const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export const usePinballGameStore = create()(
    persist(
        (set, get) => ({

            theme: "Dark",
            toggleTheme: () => {
                const newTheme = get().theme == "Dark" ? "Light" : "Dark"
                set((prev) => ({
                    theme: newTheme
                }))
            },
            setTheme: (newValue) => {
                set((prev) => ({
                    theme: newValue
                }))
            },

            machine: 'USA Pinball',
            setMachine: (newValue) => {
                set((prev) => ({
                    machine: newValue
                }))
            },

            score: 0,
            setScore: (newValue) => {
                set((prev) => ({
                    score: newValue
                }))
            },
            addScore: (newValue) => {
                set((prev) => ({
                    score: (prev.score + newValue)
                }))
            },

            rightPaddle: false,
            setRightPaddle: (newValue) => {
                set((prev) => ({
                    rightPaddle: newValue
                }))
            },

            leftPaddle: false,
            setLeftPaddle: (newValue) => {
                set((prev) => ({
                    leftPaddle: newValue
                }))
            },

            spring: false,
            setSpring: (newValue) => {
                set((prev) => ({
                    spring: newValue
                }))
            },

            springHitCount: 0,
            springHitPosition: [0, 0, 0],
            triggerSpringHit: (pos) => {
                set((prev) => ({
                    springHitCount: prev.springHitCount + 1,
                    springHitPosition: pos,
                }))
            },

            ballsLeft: 2,
            setBallsLeft: (newValue) => {
                set((prev) => ({
                    ballsLeft: newValue
                }))
            },
            removeBall: (newValue) => {
                set((prev) => {

                    console.log("Test", prev.ballsLeft)

                    if (prev.ballsLeft <= 0 && prev.score > 0) {
                        // setLocalStorage('game:pinball:recentGames', [
                        //     ...prev.recentGames,
                        //     {
                        //         score: prev.score,
                        //         machine: prev.machine,
                        //         date: new Date,
                        //     }
                        // ])
                    }

                    return ({
                        ballsLeft: (prev.ballsLeft - 1),
                        ...(prev.ballsLeft <= 0 && {

                            ...(prev.score > 0 && {
                                recentGames: [
                                    ...prev.recentGames,
                                    {
                                        score: prev.score,
                                        machine: prev.machine,
                                        date: new Date,
                                    }
                                ]
                            }),

                            score: 0,
                            ballsLeft: 2,
                        }),
                    })
                })
            },

            recentGames: [],
            setRecentGames: (newValue) => {
                set((prev) => ({
                    recentGames: newValue
                }))
                // setLocalStorage('game:pinball:recentGames', newValue)
            },
            addRecentGame: (newValue) => {
                set((prev) => ({
                    recentGames: [
                        ...prev.recentGames,
                        newValue
                    ]
                }))
            },

        }),
        {
            name: 'pinball-storage', // name of the item in the storage (must be unique)
            //   storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
        },
    ),
)