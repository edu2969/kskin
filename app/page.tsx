import Welcome from "@/components/Welcome";
import { CatalogList } from "@/components/CatalogList";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header"
import { Specialists } from "@/components/Specialists"
import { Promotions } from "@/components/Promotions"
import { Testimonials } from "@/components/Testimonials"
import { Contact } from "@/components/Contact"

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    console.log("SESSION", session);
  }

  return (
    <>
      <Header/>
      <div className="max-w-screen-lg m-auto bg-white overflow-x-hidden overflow-y-hidden pb-24">
        <Welcome/>
        <CatalogList session={session} />
        <Specialists/>
        <Promotions/>
        <Testimonials/>
        <Contact/>
      </div>
    </>
  );
}