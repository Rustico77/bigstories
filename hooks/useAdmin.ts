import { getAllUser } from "@/app/actions/user";
import { UserModel, UserResponse } from "@/app/models/user";
import { useEffect, useState } from "react";



export function useAdmin() {
    const [listAdmin, setListAdmin] = useState<Array<UserResponse> | []>([]);
    const [adminLoading, setAdminLoading] = useState(true);

    async function loadAdmins() {
        setAdminLoading(true);
        const res = await getAllUser();
        setListAdmin(res.data);
        setAdminLoading(false);
    }

    // useEffect(() => {
    //     loadAdmins();
    // }, []);

    return { listAdmin, loadAdmins, adminLoading };
}