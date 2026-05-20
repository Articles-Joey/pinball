"use client"
import { Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

// import axios from 'axios'

// import { useHotkeys } from 'react-hotkeys-hook';

// import GameScoreboard from '@/components/UI/GameScoreboard'

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

import ArticlesButton from '@/components/UI/Button';
// import useFullscreen from '@/hooks/useFullScreen';
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import Link from 'next/link';
// import routes from '@/components/constants/routes';
import { usePinballGameStore } from '@/hooks/usePinballGameStore';
import { format } from 'date-fns';
import { useStore } from '@/hooks/useStore';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';
import { useRouter } from 'next/navigation';

export default function GameMenuContent({ }) {

    const storeReloadScene = useStore(state => state.reloadScene)

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const reloadScene = () => {
        // setWinner(false)
        setScore(0)
        setBallsLeft(2)
        storeReloadScene()
    };

    const score = usePinballGameStore(state => state.score)
    const setScore = usePinballGameStore(state => state.setScore)
    const ballsLeft = usePinballGameStore(state => state.ballsLeft)
    const setBallsLeft = usePinballGameStore(state => state.setBallsLeft)
    const recentGames = usePinballGameStore(state => state.recentGames)
    const setRecentGames = usePinballGameStore(state => state.setRecentGames)

    const setShowSettingsModal = useStore((state) => state.setShowSettingsModal)

    const personalBest = useMemo(() => {
        if (!recentGames || !recentGames.length) return []; // Handle empty or undefined arrays

        return recentGames
            .slice() // Create a copy to avoid mutating the original array
            .sort((a, b) => b.score - a.score) // Sort scores in descending order
            .slice(0, 5); // Get the top 5 scores
    }, [recentGames]);

    const mostRecentGames = useMemo(() => {
        if (!recentGames || !recentGames.length) return []; // Handle empty or undefined arrays

        return recentGames
            .slice() // Create a copy to avoid mutating the original array
            .slice(-5) // Get the top 5 scores
            .sort((a, b) => b.date - a.date)
    }, [recentGames]);

    return (
        <div className='menu-card-content'>

            <div className='d-flex flex-wrap mb-3'>

                <GameMenuPrimaryButtonGroup
                    useStore={useStore}
                    type="GameMenu"
                    useRouter={useRouter}
                />

            </div>

            <div className="card card-articles mb-3">
                <div className="card-header p-2">
                    Balls Left: {ballsLeft}
                </div>
                <div className="card-body p-2">
                    Current Score: {score}
                </div>
                <div className="card-footer">
                    <ArticlesButton
                        small
                        className="w-100"
                        onClick={reloadScene}
                    >
                        <i className="fad fa-redo"></i>
                        Reset Game
                    </ArticlesButton>
                </div>
            </div>

            <div className="card card-articles mb-3">
                <div className="card-header p-2">
                    Personal Scores
                </div>
                <div className="card-body p-2  text-center border-bottom">
                    <div className='small'>Most Recent Games - {recentGames?.length || 0}</div>
                    <div>
                        {mostRecentGames.map((game, game_i) => {
                            return (
                                <div key={game_i} className='small'>
                                    {/* <span>{game.machine}</span><span> - </span> */}
                                    {game.score} - {format(game.date, "MM/dd/yy hh:mmaa")}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="card-body p-2 text-center">
                    <div className='small'>Personal Best</div>
                    <div>
                        {personalBest.map((game, game_i) => {
                            return (
                                <div key={game_i} className='small'>
                                    {/* <span>{game.machine}</span><span> - </span> */}
                                    {game.score} - {format(game.date, "MM/dd/yy hh:mmaa")}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="card-footer">
                    <ArticlesButton
                        small
                        className="w-100"
                        onClick={() => {
                            setRecentGames([])
                        }}
                    >
                        <i className="fad fa-redo"></i>
                        Reset Scores
                    </ArticlesButton>
                </div>
            </div>

        </div>
    )

}