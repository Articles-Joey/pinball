"use client"
import { lazy, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

// import axios from 'axios'
// import ROUTES from '@/components/constants/routes';
// import { useHotkeys } from 'react-hotkeys-hook';

// import GameScoreboard from 'components/Games/GameScoreboard'
const GameScoreboard = dynamic(() => import('@/components/UI/GameScoreboard'), {
    ssr: false,
});

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
import Link from 'next/link';
// import SingleInput from '@/components/Articles/SingleInput';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
// import { useSelector } from 'react-redux';
import { usePinballGameStore } from '@/hooks/usePinballGameStore';
import MachinePreviewCanvas from '@/components/Game/MachinePreviewCanvas';

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const CreditsModal = dynamic(
    () => import('@/components/UI/CreditsModal'),
    { ssr: false }
)

// import LandingSceneCanvas from '@/components/Game/LandingSceneCanvas';
const LandingSceneCanvas = lazy(() => import('@/components/Game/LandingSceneCanvas'));
// const LandingSceneCanvas = dynamic(
//     () => import('@/components/Game/LandingSceneCanvas'),
//     { ssr: false }
// )

const pinballMachines = [
    {
        name: 'USA Pinball',
        preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/usa-pinball-thumbnail.jpg`
    },
    {
        name: 'Space Pinball',
        preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/space-pinball-thumbnail.webp`
    },
    {
        name: 'Articles Pinball',
        preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/articles-pinball-thumbnail.webp`
    },
    {
        name: 'H3H3 Pinball',
        preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/h3-pinball-thumbnail.jpg`,
        machine_preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/h3h3-pinball-machine-preview.jpg`,
    },
    {
        name: "Nature Pinball",
        preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/nature-pinball-thumbnail.webp`,
    },
    {
        name: "Ocean Pinball",
        preview: `${process.env.NEXT_PUBLIC_CDN}games/Pinball/ocean-pinball-thumbnail.webp`,
    }
]

export default function PinballLandingPage(props) {

    const theme = usePinballGameStore(state => state.theme);
    const toggleTheme = usePinballGameStore(state => state.toggleTheme);
    const machine = usePinballGameStore(state => state.machine);
    const setMachine = usePinballGameStore(state => state.setMachine);

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showCreditsModal, setShowCreditsModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    const activeMachine = useMemo(() => {

        return pinballMachines.find(obj => obj.name == machine)

    }, [machine])

    return (
        <div className={`pinball-landing-page ${isFullscreen ? 'fullscreen' : ''}`} id='pinball-landing-page'>

            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showCreditsModal &&
                <CreditsModal
                    show={showCreditsModal}
                    setShow={setShowCreditsModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

            <div className='landing-scene-canvas-wrapper'>
                <LandingSceneCanvas />
            </div>

            <img src={`${process.env.NEXT_PUBLIC_CDN}games/Pinball/pinball-landing-background.webp`} alt="" className="background" />

            <div className="background-overlay">

            </div>

            {/* <GameScoreboard
                game="Pinball"
                machine={machine}
            /> */}

            <div className='container py-3'>

                <div className="ui-content">
    
                    <div
                        className="machine-selection card card-articles card-sm"
                    >
    
                        {/* <div style={{ position: 'relative', height: '200px' }}>
                            <Image
                                src={Logo}
                                alt=""
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div> */}
    
                        <div className='card-header d-flex align-items-center'>
    
                            <span>Select a machine to continue</span>
    
                            {/* <div className="flex-grow-1">
    
                                <div className="form-group articles mb-0">
                                    <label htmlFor="nickname">Nickname</label>
                                    <SingleInput
                                        value={nickname}
                                        setValue={setNickname}
                                        noMargin
                                    />
                                </div>
    
                                <div className='mt-1' style={{ fontSize: '0.8rem' }}>Visible to all players</div>
    
                            </div> */}
    
                        </div>
    
                        <div className="card-body">
    
                            <div className="machines">
    
                                {pinballMachines.map(obj => {
    
                                    // return
    
                                    // let lobbyLookup = lobbyDetails?.fourFrogsGlobalState?.games?.find(lobby =>
                                    //     parseInt(lobby.server_id) == id
                                    // )
    
                                    return (
                                        <div key={obj.name} className="machine">
    
                                            {/* <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                                <div className="mb-0" style={{ fontSize: '0.9rem' }}><b>Server {id}</b></div>
                                                <div className='mb-0'>{lobbyLookup?.players?.length || 0}/4</div>
                                            </div>
    
                                            <div className='d-flex justify-content-around w-100 mb-1'>
                                                {[1, 2, 3, 4].map(player_count => {
    
                                                    let playerLookup = false
    
                                                    if (lobbyLookup?.players?.length >= player_count) playerLookup = true
    
                                                    return (
                                                        <div key={player_count} className="icon" style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            ...(playerLookup ? {
                                                                backgroundColor: 'black',
                                                            } : {
                                                                backgroundColor: 'gray',
                                                            }),
                                                            border: '1px solid black'
                                                        }}>
    
                                                        </div>
                                                    )
                                                })}
                                            </div> */}
    
                                            <div className="ratio ratio-1x1 bg-black mb-2">
                                                {obj.preview &&
                                                    <img src={obj.preview} style={{ objectFit: 'cover' }} className='w-100 h-100' alt="" />
                                                }
                                            </div>
    
                                            <div className='mb-2'>{obj.name}</div>
    
                                            <ArticlesButton
                                                className="w-100"
                                                small
                                                active={obj.name == machine}
                                                // disabled={obj.name !== "USA Pinball"}
                                                onClick={() => {
                                                    setMachine(obj.name)
                                                }}
                                            >
                                                Select
                                            </ArticlesButton>
    
                                            <Link
                                                className={`w-100`}
                                                href={{
                                                    pathname: `/play`,
                                                    query: {
                                                        machine: obj.name
                                                    }
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="w-100"
                                                    small
                                                // disabled={obj.name !== "USA Pinball"}
                                                >
                                                    Play
                                                </ArticlesButton>
                                            </Link>
    
                                        </div>
                                    )
                                })}
    
                            </div>
    
                        </div>
    
                        <div className="card-footer d-flex flex-wrap justify-content-center">
    
                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowSettingsModal(prev => !prev)
                                }}
                            >
                                <i className="fad fa-cog"></i>
                                Settings
                            </ArticlesButton>
    
                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowInfoModal({
                                        game: "Pinball"
                                    })
                                }}
                            >
                                <i className="fad fa-info-square"></i>
                                Rules & Controls
                            </ArticlesButton>
    
                            <Link
                                href={'https://github.com/Articles-Joey/pinball'}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='w-50'
                            >
                                <ArticlesButton
                                    className={`w-100`}
                                    small
                                    onClick={() => {
    
                                    }}
                                >
                                    <i className="fab fa-github"></i>
                                    Github
                                </ArticlesButton>
                            </Link>
    
                            <ArticlesButton
                                className={`w-50`}
                                small
                                onClick={() => {
                                    setShowCreditsModal(true)
                                }}
                            >
                                <i className="fad fa-users"></i>
                                Credits
                            </ArticlesButton>
    
                             <ArticlesButton
                                className={`w-50 mt-3`}
                                small
                                onClick={() => {
                                    toggleTheme()
                                }}
                            >
                                <i className="fad fa-eye-dropper"></i>
                                Theme: {theme}
                            </ArticlesButton>
    
                            <ArticlesButton
                                className={`w-50 mt-3`}
                                small
                                onClick={() => {
                                    requestFullscreen('pinball-landing-page')
                                }}
                            >
                                <i className="fad fa-eye-dropper"></i>
                                Wallpaper Mode
                            </ArticlesButton>
    
                        </div>
    
                    </div>
    
                    <div
                        className="machine-preview card card-articles card-sm"
                    >
    
                        <div className='card-header d-flex align-items-center'>
    
                            <span>Machine preview</span>
    
                            {/* <div className="flex-grow-1">
    
                                <div className="form-group articles mb-0">
                                    <label htmlFor="nickname">Nickname</label>
                                    <SingleInput
                                        value={nickname}
                                        setValue={setNickname}
                                        noMargin
                                    />
                                </div>
    
                                <div className='mt-1' style={{ fontSize: '0.8rem' }}>Visible to all players</div>
    
                            </div> */}
    
                        </div>
    
                        <div className="card-body h-100 position-relative">
                            <div className="machine-preview-canvas-container bg-black p-2">
    
                                <MachinePreviewCanvas 
                                    key={machine}
                                />
    
                                {/* {activeMachine?.machine_preview &&
                                    <img
                                        src={activeMachine.machine_preview}
                                        style={{ objectFit: 'cover' }}
                                        className='w-100 h-100'
                                        alt=""
                                    />
                                } */}
    
                            </div>
                        </div>
    
                        <div className="card-footer d-flex flex-wrap justify-content-center">
                            <Link
                                className={`w-100`}
                                href={{
                                    pathname: `/play`,
                                    query: {
                                        machine: machine
                                    }
                                }}
                            >
                                <ArticlesButton
                                    className="w-100"
                                    small
                                    disabled={machine !== "USA Pinball"}
                                >
                                    Play
                                </ArticlesButton>
                            </Link>
                        </div>
    
                    </div>
                    
                </div>

            </div>

            {/* <Ad section={"Games"} section_id={'USA Pinball'} /> */}

        </div>
    )
}