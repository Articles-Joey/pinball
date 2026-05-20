"use client"
import { Suspense, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import { useStore } from '@/hooks/useStore';
import useTouchControlsStore from '@/hooks/useTouchControlsStore';
import classNames from 'classnames';
import GameMenuContent from '@/components/UI/GameMenuContent';
import { usePinballGameStore } from '@/hooks/usePinballGameStore';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function UsaPinballGamePage(props) {

    const showMenu = useStore(state => state.showMenu);
    const sceneKey = useStore(state => state.sceneKey);
    const sidebar = useStore(state => state.sidebar);

    const touchControlsEnabled = useTouchControlsStore(state => state.enabled);

    const ballsLeft = usePinballGameStore(state => state.ballsLeft)
    const score = usePinballGameStore(state => state.score)
    const leftPaddle = usePinballGameStore(state => state.leftPaddle)
    const setLeftPaddle = usePinballGameStore(state => state.setLeftPaddle)
    const rightPaddle = usePinballGameStore(state => state.rightPaddle)
    const setRightPaddle = usePinballGameStore(state => state.setRightPaddle)
    const setSpring = usePinballGameStore(state => state.setSpring)

    return (
        <div
            className={classNames(
                `game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameMenu
                useStore={useStore}
                LeftPanelContent={GameMenuContent}
                menuBarConfig={{
                    style: "Bar",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Floating Panel",
                }}
            />

            <div className='game-content'>

                {touchControlsEnabled &&
                    <TouchControls />
                }

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

        </div>
    )
}