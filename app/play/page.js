import { Suspense } from "react"
import GamePage from "./play"
// import metadataAppend from "util/metadataAppend"

export const metadata = {
    title: `Pinball`,
}

export default function Page() {
    return (
        <Suspense><GamePage /></Suspense>
    )
}