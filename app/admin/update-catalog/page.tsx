import { Navigation } from "@/components/Navigation";
import { ImportCatalog } from "@/components/AdminPanel/ImportCatalog"

export default async function UpdateCatalog() {
    return (        
        <main>
            <Navigation/>
            <ImportCatalog/>
        </main>        
    );
}