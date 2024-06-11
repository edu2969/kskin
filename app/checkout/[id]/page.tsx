import { Navigation } from "@/components/Navigation"
import { CheckOut } from "@/components/CheckOut"
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Agenda({ params } : { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session} />
            <CheckOut session={session} catalogId={params.id}/>
        </main>        
    );
}