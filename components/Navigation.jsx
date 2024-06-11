"use client"
import { IoMdMenu, IoMdHome } from "react-icons/io"
import { MdHistoryEdu, MdOutlineSupportAgent } from "react-icons/md"
import { RiLogoutCircleLine } from "react-icons/ri"
import { LuUserCircle2 } from "react-icons/lu"
import { GiSelfLove } from "react-icons/gi"
import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"

export const Navigation = ({ session }) => {
    const [menuActive, setMenuActive] = useState(false)
  
    const handleToggleMenu = () => {
        setMenuActive(!menuActive);
    }    

    return (<div className="z-30 nav fixed top-0 left-0">
        <label htmlFor="menu" className="icon" onClick={handleToggleMenu}>
            <div className={`menu${menuActive ? ' active' : ''}`}></div>
        </label>
        <ul className={`${menuActive ? 'visible ' : ''}absolute top-0 left-[300px] width-[220px] transition-all pr-8 border-r-8 z-20 space-y-2 pb-2 text-[#EE64C5]`}>
            {session?.user && <li className="w-full mb-16">
                <div className="rounded-full py-2 hover:bg-[#EE64C5] hover:text-white rounded-l-none"><LuUserCircle2 className="m-auto" size="6rem"/></div>
            </li>}
            <li className="rounded-md cursor-pointer hover:bg-[#EE64C5] transition-all rounded-l-none">
                <Link className="flex text-xl text-[#EE64C5] px-2 m-0 hover:text-white hover:brightness-200" href="/">
                    <img width={26} height={26} className="mx-4 mt-2" src="/simple-logo-transparent.png" alt="logo KSkin" />
                    <p className="mt-2"> HOME</p>
                </Link>
            </li>
            <li className="rounded-md cursor-pointer hover:bg-[#EE64C5] transition-all rounded-l-none">
                <Link className="flex text-xl text-[#EE64C5] px-2 m-0 hover:text-white hover:brightness-200" href="/calendar">
                    <GiSelfLove size="1.75rem" className="ml-4 mr-4" /> MI AGENDA                
                </Link>
            </li>
            {session?.user && <li className="flex px-2 text-xl rounded-md cursor-pointer hover:bg-[#EE64C5] hover:text-white transition-all rounded-l-none pt-5"
            onClick={() => signOut({ callbackUrl: '/', redirect: true }) }>
                <RiLogoutCircleLine size="1.75rem" className="ml-4 mr-4" /> CERRAR
            </li>}
        </ul>
    </div>)
}