import { Admin } from "@/components/Admin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    return (        
        <Admin session={session}/>
    );
}