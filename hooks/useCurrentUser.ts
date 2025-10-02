"use client";

import { getSessionAction } from "@/app/actions/auth";
import { getSingleUser } from "@/app/actions/user";
import { UserResponse } from "@/app/models/user";
import { useEffect, useState } from "react";


export function useCurrentUser() {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadUser() {
        setLoading(true);
        const session = await getSessionAction();
        if (session) {
            const user = await getSingleUser(session.userId);
            setUser(user.data);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadUser();
    }, []);

    return { user, loading };
}
