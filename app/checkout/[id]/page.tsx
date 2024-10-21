import { Navigation } from "@/components/Navigation"
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { CheckOut } from "@/components/CheckOut"

export default async function({ params } : { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    console.log("PARAMS", params);
    return (        
        <main>
            <Navigation session={session} />
            <CheckOut session={session} catalogId={params.id}/>
        </main>        
    );
}