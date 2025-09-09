import { Navigation } from "@/components/Navigation"
import { getServerSession } from "next-auth";
import { CheckOut } from "@/components/CheckOut"

export default async function({ params } : { params: { id: string } }) {
    return (        
        <main>
            <Navigation/>
            <CheckOut catalogId={params.id}/>
        </main>        
    );
}