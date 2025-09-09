import Navigation from "@/components/Navigation"
import { CheckOut } from "@/components/CheckOut"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export default async function({ params } : { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session}/>
            <CheckOut catalogId={params.id} session={session}/>
        </main>
    );
}