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
            {session?.user && <li className="w-full">
                <div className="rounded-xl py-2 hover:bg-white hover:text-[#A4A5A1] rounded-l-none"><LuUserCircle2 className="m-auto" size="6rem"/></div>
            </li>}
            <li className="text-2xl rounded-md cursor-pointer hover:bg-white transition-all rounded-l-none">
                <Link className="flex text-[#EE64C5] p-2 m-0 hover:text-[#A4A5A1] " href="/">
                    <IoMdHome size="1.75rem" className="ml-4 mr-4" /> Home
                </Link>
            </li>
            <li className="flex p-2 text-2xl rounded-md cursor-pointer hover:bg-white hover:text-[#A4A5A1] transition-all rounded-l-none">
                <MdHistoryEdu size="1.75rem" className="ml-4 mr-4" /> La Historia
            </li>
            <li className="flex p-2 text-2xl rounded-md cursor-pointer hover:bg-white hover:text-[#A4A5A1] transition-all rounded-l-none">
                <GiSelfLove size="1.75rem" className="ml-4 mr-4" /> Relatos
            </li>
            <li className="flex p-2 text-2xl rounded-md cursor-pointer hover:bg-white hover:text-[#A4A5A1] transition-all rounded-l-none">
                <MdOutlineSupportAgent size="1.75rem" className="ml-4 mr-4" /> Contacto
            </li>
            {session?.user && <li className="flex p-2 text-2xl rounded-md cursor-pointer hover:bg-white hover:text-[#A4A5A1] transition-all rounded-l-none"
            onClick={() => signOut({ callbackUrl: '/', redirect: true }) }>
                <RiLogoutCircleLine size="1.75rem" className="ml-4 mr-4" /> Cerrar
            </li>}
        </ul>
    </div>)
}