import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Navigation } from "@/components/Navigation";
import { LoginForm } from "@/components/AdminPanel/LoginForm"

export default async function Admin({ params } : { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session}/>
            <LoginForm session={session}/>
        </main>        
    );
}