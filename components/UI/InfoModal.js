import { useEffect, useState } from "react";

import Image from "next/image";
import dynamic from 'next/dynamic'

// import { useSelector } from 'react-redux'

import { Modal } from "react-bootstrap"

import IsDev from "@/components/UI/IsDev";
import ArticlesButton from "./Button";

export default function GameInfoModal({
    show,
    setShow,
    credits
}) {

    const [showModal, setShowModal] = useState(true)

    return (
        <>
            {/* {lightboxData && (
                <Lightbox
                    mainSrc={lightboxData?.location}
                    onCloseRequest={() => setLightboxData(null)}
                    reactModalStyle={{
                        overlay: {
                            zIndex: '2000'
                        }
                    }}
                />
            )} */}

            <Modal
                className="articles-modal games-info-modal"
                size='md'
                show={showModal}
                centered
                scrollable
                onExited={() => {
                    setShow(false)
                }}
                onHide={() => {
                    setShowModal(false)
                }}
            >

                <Modal.Header closeButton>
                    <Modal.Title>Game Info</Modal.Title>
                </Modal.Header>

                <Modal.Body className="flex-column p-0">

                    <div className="p-3">
                        
                    </div>

                </Modal.Body>

                <Modal.Footer className="justify-content-between">

                    <div></div>

                    <ArticlesButton variant="outline-dark" onClick={() => {
                        setShow(false)
                    }}>
                        Close
                    </ArticlesButton>

                </Modal.Footer>

            </Modal>
        </>
    )

}