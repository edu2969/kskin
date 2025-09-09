'use client'
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { TbBrandGoogleFilled } from "react-icons/tb"
import { FaEye, FaEyeSlash, FaMeta } from "react-icons/fa6"
import { FaCheckCircle } from "react-icons/fa"
import { GoClockFill } from "react-icons/go";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { BsBalloonHeartFill, BsCalendarHeartFill } from "react-icons/bs";
import { MdNavigateBefore, MdNavigateNext, MdOutlinePriceCheck } from "react-icons/md"
import { useEffect, useRef, useState } from "react"
import { signIn } from "next-auth/react"
import { Loader } from "./Loader";
import { CarrouselDias } from "./CarrouselDias"
import numberFormat from "@/app/utils/currency"
import dayjs from "dayjs";
import axios from 'axios';
import 'dayjs/locale/es';
import Link from "next/link";

dayjs.locale("es");

export const CheckOut = ({ session, catalogId }) => {
    const getPrimerDia = () => {
        var hoy = dayjs();
        if (hoy.day() == 6) {
            hoy = dayjs(hoy).add(2, "days");
        } else if (hoy.day() == 0) {
            hoy = dayjs(hoy).add(1, "days");
        }
        return hoy.toDate();
    }

    const [sessionId] = useState(new Date().getTime());
    const [fecha, setFecha] = useState(getPrimerDia());
    const [horarios, setHorarios] = useState([]);

    const params = useSearchParams();
    const [registrationMode, setRegistrationMode] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [repasswordVisible, setRepasswordVisible] = useState(false);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const {
        register,
        formState: {
            errors
        },
        handleSubmit,
    } = useForm();
    const [login, setLogin] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [catalog, setCatalog] = useState(null);
    const [giftCard, setGiftCard] = useState(false);
    const [reserveLater, setReserveLater] = useState(false);
    const [esAbonado, setEsAbonado] = useState(false);
    const [checkOut, setCheckOut] = useState({
        mes: '',
        dias: [],
        verificatingPayment: params.get('token_ws') != null,
    });    

    const identificationHandler = async (data) => {
        if (registrationMode) {
            try {
                const resUserExists = await fetch("/api/userExists", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: data.email }),
                });
                const { user } = await resUserExists.json();
                if (user) {
                    setError("User already exists.");
                    return;
                }
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: data.email,
                        password: data.password,
                    }),
                });

                if (res.ok) {
                    console.log("Registrado!");
                    const signInRes = await signIn("credentials", {
                        email: data.email,
                        password: data.password,
                        redirect: false,
                    });

                    if (signInRes?.error) {
                        setError("Invalid Credentials");
                        return;
                    }                    
                } else {
                    console.log("User registration failed.");
                }
            } catch (error) {
                console.log("Error during registration: ", error, {
                    email: data.email,
                    password: data.password,
                });
            }
        } else {
            const signInRes = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: true,
            });
            setLogin(false);
            if (signInRes?.error) {
                setError("Invalid Credentials");                
                return;
            }
        }
    }

    const toggleRegistration = (value) => {
        setRegistrationMode(value);
    }

    const handleSelectPlace = async (indiceHorario) => {
        const indice = checkOut.sesiones.findIndex(s => s == null);
        var sesiones = checkOut.sesiones;
        const horario = dayjs(horarios[indiceHorario].fecha);
        sesiones[indice] = dayjs(fecha).hour(horario.hour()).minute(horario.minute()).startOf("minute").toDate();
        setCheckOut({
            ...checkOut,
            sesiones,
            sesionesOk: true,
        });
    }

    const handleDateConfirmed = async () => {
        const resp = await fetch('/api/checkout', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId,
                catalogId: catalogId,
                sessions: checkOut.sesiones,
                esAbonado: esAbonado,
                esGiftCard: giftCard,
            })
        })
        setConfirmando(true);
        const r = await resp.json();
        console.log("TOKEN", r);
        if(r.url && r.token) {
            window.location = `${r.url}?token_ws=${r.token}`
        } else alert("ERROR", r);        
    }

    const checkPayment = async () => {
        const token_ws = params.get('token_ws');
        if (token_ws != null && token_ws != undefined) {
            const nc = {...checkOut};
            nc.catalogId = catalogId;
            nc.sesionesOk = true;
            nc.sesionesConfirmadas = true;
            nc.productoConfirmado = true;
            nc.verificatingPayment = true;
            const verification = await fetch(`/api/verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token_ws,
                    catalogId: catalogId,
                    clientId: session?.user?.id,
                })
            });
            const respVerify = await verification.json();
            console.log("RESP-Verification", respVerify)
            if (respVerify.vci == "TSY") {
                nc.payment = respVerify;                
            } else {
                nc.paymentError = true;
            }
            nc.verificatingPayment = false;
            setCheckOut(nc);
        } else getCatalogSelected();
    }

    const getCatalogSelected = async () => {
        try {
            const response = await fetch(`/api/catalog/${catalogId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            var catalogo = await response.json();
            setCatalog(catalogo.catalog);
            initCalendario(Array.from(Array(catalogo.catalog.sessionCount == 0 ? 1 : catalogo.catalog.sessionCount).keys()).map(i => {
                return null
            }), catalogo.catalog);
        } catch (error) {
            console.error('Error fetching catalog:', error);
        }
    }

    const initData = useRef(false);
    useEffect(() => {
        if (!initData.current) {
            initData.current = true
            checkPayment();
        }
    }, []);

    const handleCheckboxChange = (event) => {
        console.log("EVENT", event.target.checked)
        setEsAbonado(event.target.checked);
    };   

    const initCalendario = async (sesiones, catalogo) => {
        console.log("INIT CALENDARIO", catalogo);
        const mes = dayjs().format('MMMM');
        const numeroMes = dayjs().get("month");
        var diaSemana = dayjs().endOf("week").add(1, "day").startOf("date");

        try {
            const response = await fetch(`/api/schedule?date=${dayjs().format('YYYY-MM-DD')}&catalogId=${catalogId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const availableSlots = await response.json();
            console.log("AVAIBLE", catalogo);

            var dias = [];
            for (var i = 0; i < 5; i++) {
                var dia = {
                    numeroDia: diaSemana.date(),
                    horarios: availableSlots.map(slot => {
                        return {
                            ocupado: false,
                            desde: { hrs: dayjs(slot).hour(), min: dayjs(slot).minute() },
                            hasta: { hrs: dayjs(slot).add(catalogo.durationMins, 'minute').hour(), min: dayjs(slot).add(catalogo.durationMins, 'minute').minute() },
                            fecha: dayjs(slot).toDate(),
                            pasado: dayjs(slot).isBefore(new Date()),
                        }
                    }),
                    nombreDia: diaSemana.format("dd"),
                };
                if (diaSemana.isBefore(new Date())) {
                    dia.pasado = true;
                }
                dias.push(dia)
                diaSemana = diaSemana.add(1, "day");
            }
            setCheckOut({
                ...checkOut,
                numeroMes,
                mes,
                dias,
                sesiones
            });
            cargarHorarios(catalogo);
            setLoadingCalendar(false);
            console.log("CHECKOUT", checkOut);
        } catch (error) {
            console.error('Error fetching available slots:', error);
        }
    }

    const cargarHorarios = () => {
        console.log("CARGAR HORARIOS", fecha);
        setLoadingCalendar(true);
        axios.get(`/api/schedule?date=${dayjs(fecha).format('YYYY-MM-DD')}&catalogId=${catalogId}`)
            .then((response) => {
                console.log("RESPONSE", response.data);
                setHorarios(response.data.map(slot => {
                    return {
                        ocupado: false,
                        desde: { hrs: dayjs(slot).hour(), min: dayjs(slot).minute() },
                        hasta: { hrs: dayjs(slot).add(catalog.durationMins, 'minute').hour(), min: dayjs(slot).add(catalog.durationMins, 'minute').minute() },
                        fecha: dayjs(slot).toDate(),
                        pasado: dayjs(slot).isBefore(new Date()),
                    }
                }));
                setLoadingCalendar(false);
            })
            .catch((error) => {
                console.error('Error fetching available slots:', error);
            });
    }

    return <>
        <div className="w-full bg-slate-100 overflow-x-hidden pb-24 h-screen">

            <div className="flex w-full pt-8 pb-4 justify-center">
                <div className={`flex w-1/4 justify-center`}>
                    <div className={`${session?.user ? 'text-green-500' : 'text-[#b0a3ac]'}`}>
                        {session?.user ? <FaCheckCircle className="mt-0.5" size="2rem" /> : <p className="rounded-full bg-pink-700 text-pink-300 h-8 w-8 pl-2.5 pt-1 mt-1 ml-10 font-extrabold">1</p>}
                    </div>
                    <p className={`font text-xl ml-4 mt-1 ${session?.user ? 'text-green-500' : 'text-[#EE64C5]'}`}>
                        {session?.user ? ('HOLA ' + session?.user.name?.split(" ")[0].toUpperCase() || "Desconocid@") : 'QUIÉN ERES'}
                    </p>
                </div>
                <div className={`flex w-1/4 justify-center h-10 ${checkOut?.sesionesOk ? 'text-green-500' : session?.user ? 'text-[#EE64C5]' : 'text-[#b0a3ac]'}`}>
                    <div>
                        {checkOut?.sesionesOk ? <FaCheckCircle className="text-green-500 mt-0.5" size="2rem" /> : <p className="rounded-full bg-pink-700 text-white h-8 w-8 pl-2.5 pt-1 mt-1 ml-10 font-extrabold">2</p>}
                    </div>
                    <p className="font text-lg ml-4 mt-1">FECHA / CONFIRMACIÓN</p>
                </div>
                <div className={`flex w-1/4 justify-center h-10 ${checkOut?.productoConfirmado ? 'text-green-500' : 'text-[#b0a3ac]'}`}>
                    <div>
                        {checkOut?.productoConfirmado ? <FaCheckCircle className="text-green-500 mt-0.5" size="2rem" /> : <p className="rounded-full bg-pink-700 text-pink-300 h-8 w-8 pl-2.5 pt-1 mt-1 ml-10 font-extrabold">3</p>}
                    </div>
                    <p className="font text-xl ml-4 mt-1">PAGO</p>
                </div>
            </div>

            <div className="absolute w-full left-0 top-16 h-screen overflow-hidden">
                <form className="relative text-[#A4A5A1] z-30 bg-white mt-28 p-6 mx-auto shadow w-[860px] rounded-lg full-shadow">
                    {!session?.user && <>
                        <h1 className="text-3xl text-center mb-4 uppercase tracking-widest">
                            <span className="cursor-pointer hover:text-blue-500 hover:underline" onClick={() => { toggleRegistration(false) }}>Identifícate</span>
                            <span className="lowercase"> ó&nbsp;</span>
                            <span className="cursor-pointer hover:text-blue-500 hover:underline" onClick={() => { toggleRegistration(true) }}>Regístrate</span>
                        </h1>
                        {!login ? <div>
                            <div className="relative border-2 rounded-xl border-gray-300 focus:border-blue-600 w-[260px] m-auto">
                                <input type="email"
                                    {...register('email', {
                                        required: true,
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "Entered value does not match email format"
                                        }
                                    })}
                                    id="email"
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent rounded-xl border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="email" className="absolute text-sm text-gray-400 dark:text-white duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-gray-400 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    e-mail</label>
                            </div>
                            {errors.email && <div className="text-red-400 w-[260px] text-sm mx-auto my-0 pb-2 pl-2"><span>Ingrese un email válido</span></div>}
                            <div className="relative border-2 rounded-xl border-gray-300 focus:border-blue-600 w-[260px] mx-auto mt-4">
                                <input type={passwordVisible ? 'text' : 'password'}
                                    {...register('password', { required: true })}
                                    id="password"
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent rounded-xl border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="password" className="absolute text-sm text-gray-400 dark:text-white duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#A4A5A1] peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    password</label>
                                <div className="absolute right-3 top-2.5 cursor-pointer" onClick={() => { setPasswordVisible(!passwordVisible) }}>
                                    {passwordVisible ? <FaEye size="1.5rem" /> : <FaEyeSlash size="1.5rem" />}
                                </div>
                            </div>
                            {errors.password && <div className="text-red-400 w-[260px] text-sm mx-auto my-0 pb-2 pl-2"><span>Paassword obligatorio</span></div>}
                            {registrationMode && <div className="relative border-2 rounded-xl border-gray-300 focus:border-blue-600 w-[260px] mx-auto mt-4">
                                <input type={repasswordVisible ? 'text' : 'password'}
                                    {...register('repassword', { required: true })}
                                    id="repassword"
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm bg-transparent rounded-xl border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="repassword" className="absolute text-sm text-gray-300 dark:text-white duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#f2f2f2] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#A4A5A1] peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    re-password</label>
                                <div className="absolute right-3 top-2.5 cursor-pointer" onClick={() => { setRepasswordVisible(!repasswordVisible) }}>
                                    {repasswordVisible ? <FaEye size="1.5rem" /> : <FaEyeSlash size="1.5rem" />}
                                </div>
                            </div>}
                            {errors.repassword && <div className="text-red-400 w-[260px] text-sm mx-auto my-0 pb-2 pl-2"><span>Re-password obligatorio</span></div>}

                            <div className="button-container">
                                <button onClick={handleSubmit(identificationHandler)}
                                    className="w-[260px] btn border-solid border-2 border-[#EE64C5] rounded-lg relative overflow-hidden bg-[#EE64C5] font-extrabold text-2xl py-1 px-9 tracking-widest">
                                    {registrationMode ? 'REGISTRAR' : 'ENTRAR'}
                                </button>
                            </div>
                            <div className="button-container">
                                <button className="w-[260px] flex justify-center btn border-solid border-2 border-slate-400 rounded-lg relative overflow-hidden bg-white font-extrabold text-2xl py-1 px-9 ">
                                    <TbBrandGoogleFilled className="text-black mr-2" size="2rem" /><span className="text-black font-bold"> Google</span>
                                </button>
                            </div>
                            <div className="button-container">
                                <button onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-[260px] flex justify-center btn border-solid border-2 border-blue-400 rounded-lg relative overflow-hidden bg-blue-300 text-slate-100 font-extrabold text-2xl py-1 px-9">
                                    <FaMeta className="mr-2" size="2rem" /><b> Meta</b>
                                </button>
                            </div>
                        </div> :
                            <Loader />}                        
                    </>}

                    {(!checkOut.verificatingPayment && !reserveLater && !giftCard && session?.user && !checkOut.sesionesConfirmadas && !checkOut.productoConfirmado) && <>
                        <h1 className="text-xl text-center mb-4 text-slate-700">
                            <span>{dayjs(fecha).format("MMMM, YYYY").toUpperCase()}</span>
                        </h1>
                        <CarrouselDias fecha={fecha} setFecha={setFecha} cargarHorarios={cargarHorarios}/>

                        <p className="text-center my-2">{horarios.length ? 'HORARIOS DISPONIBLES' : 'SIN HORARIOS DISPONIBLES'}</p>
                        {loadingCalendar ? <div className="w-full flex justify-center">
                            <div className="w-[480px] h-9"><Loader /></div>
                        </div>
                        : <div className="w-full flex flex-wrap justify-center">
                            {horarios.length > 0 && horarios.map((h, indice) => <div onClick={() => handleSelectPlace(indice)}
                                key={`_${h.numeroDia}_${indice}`}
                                className={`border-brown-800 hover:bg-white hover:text-slate-500 cursor-pointer text-md font-bold border-2 rounded-md text-center mr-2 py-1 mb-2 zeyada w-[96px]`}>
                                <span>{h.desde.hrs < 10 && '0'}{h.desde.hrs}</span> : <span>{h.desde.min == 0 && '0'}{h.desde.min}</span>
                            </div>)}
                        </div>}

                        <p className={`text-xl mt-4 uppercase tracking-widest text-center ${checkOut.sesionesOk ? 'text-black' : ''}`}>
                            {checkOut.sesionesOk ? `Sesiones listas. Presiona continuar` : `Seleccione su primera sesión`}
                        </p>
                        <div className="flex flex-wrap justify-center">
                            {checkOut?.sesiones && (
                                <div className={`bg-white border-2 border-slate-400 rounded-md py-1 px-4 m-2`}>
                                    <p className={`uppercase tracking-widest font-bold text-[#EE64C5]`}>1era Sesión</p>
                                    <p className="uppercase text-bold">{checkOut.sesiones[0] != null ? dayjs(checkOut.sesiones[0]).format("DD/MMM/YY HH:mm") : '--/--/-- --:--'}</p>
                                </div>
                            )}
                        </div>
                    </>}

                    {(!checkOut.verificatingPayment && checkOut.sesiones?.length > 0 && session?.user && !checkOut.sesionesConfirmadas && !checkOut.productoConfirmado) && (
                        <div className="flex justify-center">
                            <div className="flex items-center mr-8">
                                <input
                                    type="checkbox"
                                    id="giftCard"
                                    checked={giftCard}
                                    onChange={(e) => setGiftCard(e.target.checked)}
                                    className="mr-2 w-5 h-5"
                                />
                                <label htmlFor="giftCard" className="text-[#EE64C5]">Quiero regalarla como GIFTCARD</label>
                            </div>
                            {!checkOut.sesionesOk && <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="reserveLater"
                                    checked={reserveLater}
                                    onChange={(e) => setReserveLater(e.target.checked)}
                                    className="mr-2 w-5 h-5"
                                />
                                <label htmlFor="reserveLater" className="text-[#EE64C5]">Reservaré más adelante</label>
                            </div>}
                        </div>
                    )}
                    
                    {(!checkOut.verificatingPayment && (giftCard || reserveLater) && session?.user && !checkOut.sesionesConfirmadas && !checkOut.productoConfirmado) && <>
                    <div className="flex justify-center py-8 text-[#EE64C5]">
                        {giftCard && <>
                            <BsBalloonHeartFill size="6rem"/>
                            <div className="ml-4">
                                <p className="text-2xl text-[#EE64C5] font-bold uppercase tracking-wider ml-2 mt-2">¡Tu regalo le encantará!</p>
                                <p className="text-md">Envíalo por mail, o por un cargo adicional, <br/>lo enviamos a la dirección que nos digas.</p>
                            </div>                            
                        </>}
                        {reserveLater && !giftCard && <>
                            <BsCalendarHeartFill size="6rem"/>                        
                            <div className="ml-4">
                                <p className="text-2xl text-[#EE64C5] font-bold uppercase tracking-wider mt-4">¡Reserva cuando quieras!</p>
                                <p className="text-md">En tu menú, tus sesiones, podrás definirlas más adelante*.</p>
                                <p className="text-sm">* las sisiones tienes un límite de canje.</p>
                            </div>
                        </>}
                    </div>
                    </>}

                    {!checkOut.verificatingPayment && !checkOut.sesionesConfirmadas && (checkOut.sesionesOk || giftCard || reserveLater) ? <div className="flex space-x-2 justify-center">
                        <div className="button-container">
                            <button onClick={(e) => {
                                e.preventDefault();
                                setCheckOut({
                                    ...checkOut,
                                    sesiones: checkOut.sesiones.map(s => null),
                                    sesionesOk: false,
                                    sesionesConfirmadas: false,
                                });
                            }}
                                className="w-[260px] btn flex border-solid border-2 border-pink-300 rounded-lg relative overflow-hidden bg-[#EE64C5] text-2xl py-1 px-9">
                                <MdNavigateBefore className="mr-2" size="2rem" /> VOLVER
                            </button>
                        </div>
                        <div className="button-container">
                            <button onClick={(e) => {
                                e.preventDefault();
                                setCheckOut({
                                    ...checkOut,
                                    sesionesConfirmadas: true,
                                });
                            }}
                                className="w-[260px] flex justify-center btn border-solid border-2 border-slate-400 rounded-lg relative overflow-hidden bg-white font-extrabold text-2xl py-1 uppercase tracking-widest">
                                <span className="text-black">Continuar </span><MdNavigateNext className="text-black mr-2" size="2rem" />
                            </button>
                        </div>
                    </div> :
                        (confirmando && <Loader />)}

                    {(checkOut.sesionesConfirmadas && !checkOut.productoConfirmado) && <>                        
                        <div className="w-full flex">
                            <div className="w-full ml-4">
                                <div className="w-full ml-6">
                                    <p className="text-left text-xl uppercase text-[#EE64C5]">PAGA TU RESERVA</p>
                                </div>
                                <div className="w-full flex flex-wrap px-4">
                                    {!giftCard && !reserveLater && (
                                        <div className="border-2 border-pink-300 bg-[#EE64C5] text-white rounded-md py-1 px-2 m-2 w-1/5">
                                            <p className="text-sm font-bold">1era SESIÓN</p>
                                            <p className="text-2xl font-bold">{checkOut.sesiones[0] != null ? dayjs(checkOut.sesiones[0]).format("HH:mm") : '--:--'}</p>
                                            <p className="text-xs uppercase tracking-widest">{checkOut.sesiones[0] != null ? dayjs(checkOut.sesiones[0]).format("DD/MMM/YYYY") : '--/-_-/--'}</p>
                                        </div>
                                    )}
                                    {giftCard && <div className="border-2 border-pink-300 bg-[#EE64C5] text-white rounded-md py-1 px-2 m-2">
                                        <p className="font-bold uppercase tracking-widest text-center">GIFTCARD</p>                                        
                                    </div>}
                                </div>
                                <div className="ml-6">
                                    <div>
                                        <input type="checkbox"
                                            checked={esAbonado}
                                            onChange={handleCheckboxChange} />
                                        <span>&nbsp;Deseo abonar la primera sesión.</span>
                                    </div>
                                    <p className="text-4xl font-bold">
                                        {esAbonado ? <>
                                            <span className="text-sm">TOTAL</span> $ {numberFormat(Math.round(catalog.price * 0.25))}
                                            <br /><span className="text-sm">SALDO</span> <span className="text-2xl">$ {numberFormat(catalog.price - Math.round(catalog.price * 0.25))}</span>&nbsp;<span className="text-xs"> *pagas tu saldo con nosotras</span>
                                        </> : <><span className="text-sm">TOTAL</span> $ {numberFormat(catalog.price)}</>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!confirmando ? <div className="flex space-x-2 justify-center">
                            <div className="button-container">
                                <button onClick={() => { }}
                                    className="w-[260px] btn text-white uppercase tracking-widest flex border-solid border-2 border-pink-300 rounded-lg relative overflow-hidden bg-[#EE64C5] text-2xl py-1 px-9">
                                    <MdNavigateBefore className="mr-2" size="2rem" /> Volver
                                </button>
                            </div>
                            <div className="button-container">
                                <button onClick={(e) => {
                                    handleDateConfirmed()
                                    e.preventDefault();
                                }}
                                    className="flex w-[260px] btn border-solid border-2 border-pink-300 rounded-lg bg-white text-2xl py-1 justify-center">
                                    <span className="text-black uppercase tracking-widest">Confirmar </span><MdNavigateNext className="text-black mr-2" size="2rem" />
                                </button>
                            </div>
                        </div> :
                            <Loader />}
                    </>}

                    {(checkOut.productoConfirmado && !checkOut.verificatingPayment)  && <div className="text-left">
                        {checkOut.payment && <div className="flex">
                            <div className="justify-start text-left uppercase tracking-widest">
                                <h1 className="text-3xl mb-4 text-[#EE64C5]">Pago exitoso</h1>
                                <p>{`Tarjeta  : **** **** ${checkOut.payment.cardNumber}`}</p>
                                <p>{`Fecha    : ${dayjs(checkOut.payment.transactionDate).format('DD/MMM/YYYY HH:mm')}`}</p>
                                <p>{`Monto    : $ ${numberFormat(checkOut.payment.amount)}`}</p>
                                <p>{`N° orden : ${checkOut.payment.orderNumber}`}</p>
                                <Link href="/agenda">
                                <button className="w-[260px] btn border-solid border-2 border-[#EE64C5] rounded-lg relative overflow-hidden bg-[#EE64C5] text-2xl py-1 px-12 text-center text-white mt-6">
                                    TU AGENDA
                                </button>
                                </Link>
                            </div>
                            <div className="m-auto">
                                <MdOutlinePriceCheck className="border-8 border-lime-400 rounded-full bg-white text-lime-400 p-4" size="10rem" />
                            </div></div>}
                        {checkOut.paymentError && <>
                            <p className="text-[#EE64C5]">`Error!!!`</p>
                        </>}                        
                    </div>}
                    {checkOut.verificatingPayment && <Loader />}
                </form>

                {catalog != null && <div className="absolute top-0 w-full full-shadow">
                    <div className="w-[920px] m-auto">
                    <div className="absolute flex w-[920px] z-10 text-[#A4A5A1] mt-6 p-0 mx-auto shadow-md rounded-lg bg-white overflow-hidden">
                        <img className="relative z-20 w-40 rounded-br-full" src={`/catalogo/${catalog.imgUrl}`} />
                        <div className="w-80 ml-4 mt-2">
                            <p className="font-bold text-xl uppercase">{catalog.specialtyName}</p>
                            <p className="text-xs uppercase">{catalog.name}</p>
                        </div>
                        <div className="absolute rounded-bl-lg right-0 w-fit flex h-6 bg-green-200 px-4 border-l-">
                            <div className="flex">
                                <LiaMoneyBillSolid size="1.5rem" />
                                <span className="text-sm ml-2 mt-0.5">$ {numberFormat(catalog.price)}</span>
                            </div>
                            <div className="flex ml-4">
                                <GoClockFill size="1rem" className="mt-1" />
                                <span className="text-sm ml-1 mt-0.5">{ catalog.sessionCount > 0 ? (catalog.sessionCount + ' sesiones x') : ''} <b>{catalog.durationMins} mins</b> x {catalog.sessionCount <= 1 ? 1 : catalog.sessionCount} sesi{catalog.sessionCount > 1 ? 'ones' : 'ón'}</span>
                            </div>
                        </div>
                    </div>
                    </div>                    
                </div>}
            </div>
        </div>
    </>
}