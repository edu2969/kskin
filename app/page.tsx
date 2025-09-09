import Welcome from "@/components/Welcome";
import { CatalogList } from "@/components/CatalogList";
import { Header } from "@/components/Header"
import { Specialists } from "@/components/Specialists"
import { Promotions } from "@/components/Promotions"
import { Testimonials } from "@/components/Testimonials"
import { Contact } from "@/components/Contact"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";


export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <Header session={session} />
      <div className="max-w-screen-lg m-auto bg-white overflow-x-hidden overflow-y-hidden pb-24">
        <Welcome/>
        <CatalogList/>
        <Specialists/>
        <Promotions/>
        <Testimonials/>
        <Contact/>
      </div>
    </>
  );
}