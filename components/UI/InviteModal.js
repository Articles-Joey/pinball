"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ViewUserModal from "./ViewUserModal";
import ArticlesDate from "./ArticlesDate";
import ArticlesModal from "./ArticlesModal";
import ArticlesButton from "./Button";
import useUserFriends from "@/hooks/user/useUserFriends";

export default function InviteModal({ show, setShow }) {
    const { data: userFriends } = useUserFriends();
    const [friendsSearch, setFriendsSearch] = useState("");
    const [sentMessages, setSentMessages] = useState([]);

    return (
        <ArticlesModal show={show} setShow={setShow} title="Invite Players" contentSx={{ p: 0 }}>
            {show?.type ? (
                <Box>
                    <Box sx={{ position: "sticky", top: 0, zIndex: 1, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "center", p: "0.5rem" }}>
                        <TextField
                            label="Friend Search"
                            placeholder="Display name or username"
                            value={friendsSearch}
                            onChange={(event) => setFriendsSearch(event.target.value)}
                            size="small"
                            sx={{ maxWidth: 250, width: "100%" }}
                        />
                    </Box>
                    <Box sx={{ display: "flex" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "50%", p: "0.5rem" }}>
                            <Box>Type</Box>
                            <Box sx={{ mb: "0.5rem", fontWeight: 700 }}>{show.type}</Box>
                            <Box>Game Name</Box>
                            <Box sx={{ mb: "0.5rem", fontWeight: 700 }}>{show.game_name}</Box>
                            <Box>Server Id</Box>
                            <Box sx={{ mb: "0.5rem", fontWeight: 700 }}>{show.server_id}</Box>
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "50%", borderLeft: 1, borderColor: "divider", p: "0.5rem" }}>
                            <Box sx={{ color: "text.secondary" }}>Invited Players</Box>
                            <Box>
                                {sentMessages.map((sent) => (
                                    <Box key={sent._id} sx={{ mb: "0.25rem" }}>
                                        <ViewUserModal user_id={sent.populated_user._id} populated_user={sent.populated_user} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ borderTop: 1, borderColor: "divider" }}>
                        {userFriends?.filter((friend) => !friendsSearch || friend.populated_user.display_name?.toLowerCase().includes(friendsSearch.toLowerCase())).map((friend) => {
                            const sent = sentMessages.some((message) => message._id === friend._id);
                            return (
                                <Box key={friend._id} sx={{ borderBottom: 1, borderColor: "divider", p: "0.5rem" }}>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Box sx={{ ml: "0.5rem" }}>
                                            <ViewUserModal user_id={friend.populated_user._id} populated_user={friend.populated_user} />
                                            <Box sx={{ fontSize: "0.875em" }}>@{friend.populated_user.username}</Box>
                                            <Box sx={{ fontSize: "0.875em" }}>Added: <ArticlesDate date={friend.date} format="PP" /></Box>
                                        </Box>
                                        <ArticlesButton
                                            small
                                            sx={{ ml: "auto" }}
                                            disabled={sent}
                                            onClick={() => setSentMessages((previous) => [...previous, { _id: friend._id, populated_user: friend.populated_user }])}
                                        >
                                            {sent ? "Sent" : "Invite"}
                                        </ArticlesButton>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            ) : <Box sx={{ p: "1rem" }}>Dev Issue</Box>}
        </ArticlesModal>
    );
}
