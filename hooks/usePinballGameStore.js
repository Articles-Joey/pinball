// import { create } from 'zustand'
import { createWithEqualityFn as create } from 'zustand/traditional'

const getLocalStorage = (key) => JSON.parse(window.localStorage.getItem(key))
const setLocalStorage = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export const usePinballGameStore = create((set) => ({

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
                setLocalStorage('game:pinball:recentGames', [
                    ...prev.recentGames,
                    {
                        score: prev.score,
                        machine: prev.machine,
                        date: new Date,
                    }
                ])
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

    recentGames: getLocalStorage('game:pinball:recentGames') || [],
    setRecentGames: (newValue) => {
        set((prev) => ({
            recentGames: newValue
        }))
        setLocalStorage('game:pinball:recentGames', newValue)
    },
    addRecentGame: (newValue) => {
        set((prev) => ({
            recentGames: [
                ...prev.recentGames,
                newValue
            ]
        }))
    },

}))