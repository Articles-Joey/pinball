"use client"
import { Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

// import axios from 'axios'

// import { useHotkeys } from 'react-hotkeys-hook';

import GameScoreboard from '@/components/UI/GameScoreboard'

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
import Link from 'next/link';
// import routes from '@/components/constants/routes';
import { usePinballGameStore } from '@/hooks/usePinballGameStore';
import { format } from 'date-fns';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function UsaPinballGamePage(props) {

    const [sceneKey, setSceneKey] = useState(0);

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const [menuOpen, setMenuOpen] = useState(false)

    const reloadScene = () => {
        // setWinner(false)
        setScore(0)
        setBallsLeft(2)
        setSceneKey((prevKey) => prevKey + 1);
    };

    const {
        score,
        setScore,
        ballsLeft,
        recentGames,
        setRecentGames,
        setBallsLeft,
        leftPaddle,
        setLeftPaddle,
        rightPaddle,
        setRightPaddle,
        spring,
        setSpring
    } = usePinballGameStore()

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
        <div className={`pinball-game-page ${menuOpen ? 'menuOpen' : ''}`}>

            <div className="menu-bar">

                <ArticlesButton
                    className="noselect"
                    active={leftPaddle}
                    onMouseDown={() => setLeftPaddle(true)} // Set paddle state to true
                    onMouseUp={() => setLeftPaddle(false)} // Reset paddle state to false
                    onTouchStart={() => setLeftPaddle(true)} // Handle touch for mobile
                    onTouchEnd={() => setLeftPaddle(false)} // Handle touch for mobile
                >
                    <i className="fad fa-undo"></i>
                    Left
                </ArticlesButton>

                <div className="mx-4">
                    <ArticlesButton
                        className=""
                        active={menuOpen}
                        onClick={() => {
                            setMenuOpen(prev => !prev)
                        }}
                    >
                        Menu
                    </ArticlesButton>
                    <ArticlesButton
                        variant="success"
                        onMouseDown={() => setSpring(true)} // Set paddle state to true
                        onMouseUp={() => setSpring(false)} // Reset paddle state to false
                        onTouchStart={() => setSpring(true)} // Handle touch for mobile
                        onTouchEnd={() => setSpring(false)} // Handle touch for mobile
                    >
                        <i className="fad fa-rocket me-0"></i>
                    </ArticlesButton>
                </div>

                <ArticlesButton
                    className="noselect"
                    active={rightPaddle}
                    onMouseDown={() => setRightPaddle(true)} // Set paddle state to true
                    onMouseUp={() => setRightPaddle(false)} // Reset paddle state to false
                    onTouchStart={() => setRightPaddle(true)} // Handle touch for mobile
                    onTouchEnd={() => setRightPaddle(false)} // Handle touch for mobile
                >
                    <i className="fad fa-redo"></i>
                    Right
                </ArticlesButton>

            </div>

            <div className={`menu-card ${menuOpen ? 'show' : ''}`}>

                <div className='menu-card-content'>

                    <div className='mb-3'>

                        <Link href={'/'} className='w-50'>
                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {

                                }}
                            >
                                <i className="fad fa-sign-out fa-rotate-180"></i>
                                Leave Game
                            </ArticlesButton>
                        </Link>

                        <ArticlesButton
                            small
                            className="w-50"
                            active={isFullscreen}
                            onClick={() => {
                                if (isFullscreen) {
                                    exitFullscreen()
                                } else {
                                    requestFullscreen('usa-pinball-game')
                                }
                            }}
                        >
                            {isFullscreen && <span>Exit </span>}
                            {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                            <span>Fullscreen</span>
                        </ArticlesButton>

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

                    <Suspense>
                        <GameScoreboard
                            game="Pinball"
                            machine="Todo"
                        />
                    </Suspense>

                </div>

            </div>

            <div className='game-content'>

                <div className='canvas-three-wrap' id={`usa-pinball-game`}>

                    <div className="floating-controls">

                        <div
                            className="noselect left-bumper"
                            active={leftPaddle}
                            onMouseDown={() => setLeftPaddle(true)} // Set paddle state to true
                            onMouseUp={() => setLeftPaddle(false)} // Reset paddle state to false
                            onTouchStart={() => setLeftPaddle(true)} // Handle touch for mobile
                            onTouchEnd={() => setLeftPaddle(false)} // Handle touch for mobile
                        >
                            <i className="fad fa-hand-point-left me-0"></i>
                        </div>

                        <div
                            className="launch"
                            onMouseDown={() => setSpring(true)} // Set paddle state to true
                            onMouseUp={() => setSpring(false)} // Reset paddle state to false
                            onTouchStart={() => setSpring(true)} // Handle touch for mobile
                            onTouchEnd={() => setSpring(false)} // Handle touch for mobile
                        >
                            <i className="fad fa-rocket me-0"></i>
                        </div>

                        <div
                            className="noselect right-bumper"
                            active={rightPaddle}
                            onMouseDown={() => setRightPaddle(true)} // Set paddle state to true
                            onMouseUp={() => setRightPaddle(false)} // Reset paddle state to false
                            onTouchStart={() => setRightPaddle(true)} // Handle touch for mobile
                            onTouchEnd={() => setRightPaddle(false)} // Handle touch for mobile
                        >
                            <i className="fad fa-hand-point-right me-0"></i>
                        </div>

                    </div>

                    <div className='floating-ui'>

                        <div className="left"></div>

                        <div className="center d-flex bg-black px-1">
                            <div className="fw-bold">Score: {score}</div>
                            <div className='px-1'>-</div>
                            <div className="fw-bold">Balls Left: {ballsLeft}</div>
                        </div>

                        <div className="right"></div>

                    </div>

                    <GameCanvas
                        key={sceneKey}
                    />

                </div>

            </div>

            {/* <Ad section={"Games"} section_id={'USA Pinball'} /> */}

        </div>
    )
}