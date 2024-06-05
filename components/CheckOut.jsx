'use client'
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { TbBrandGoogleFilled } from "react-icons/tb"
import { FaEye, FaEyeSlash, FaMeta } from "react-icons/fa6"
import { FaCheckCircle } from "react-icons/fa"
import { useEffect, useRef, useState } from "react"
import { signIn } from "next-auth/react"
import { Loader } from "./Loader";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md"
import numberFormat from "@/app/utils/currency"
import dayjs from "dayjs"
import Link from "next/link";

dayjs.locale("es");

export const CheckOut = ({ session, productId }) => {
    const [sessionId, setSessionId] = useState(new Date().getTime());

    const [value, setValue] = useState({
        startDate: null,
        endDate: null
    });

    const handleValueChange = (newValue) => {
        console.log("newValue:", newValue);
        setValue(newValue);
    }

    const router = useRouter();
    const params = useSearchParams();
    const onError = (errors, e) => console.log(errors, e)
    const [menuActive, setMenuActive] = useState(false)
    const [formActive, setFormActive] = useState(true)
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
    const [error, setError] = useState("");
    const [login, setLogin] = useState(false);
    const [confirmando, setConfirmando] = useState(false);

    const [checkOut, setCheckOut] = useState({
        mes: '',
        dias: []
    });

    const identificationHandler = async (data) => {
        setLogin(true);
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
                    setLoadingCalendar(true);
                } else {
                    console.log("User registration failed.");
                }
                setLogin(false);
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

    const initCalendario = () => {
        console.log("INIT CALENDARIO");
        const mes = dayjs().format('MMMM');
        const numeroMes = dayjs().get("month");
        var diaSemana = dayjs().endOf("week").add(2, "day").startOf("date");
        var dias = [];
        var horarios = [{
            ocupado: false,
            desde: { hrs: 9, min: 30 },
            hasta: { hrs: 10, min: 45 },
        }, {
            ocupado: false,
            desde: { hrs: 11, min: 0 },
            hasta: { hrs: 12, min: 15 },
        }, {
            ocupado: true,
            desde: { hrs: 15, min: 30 },
            hasta: { hrs: 16, min: 45 },
        }, {
            ocupado: false,
            desde: { hrs: 17, min: 0 },
            hasta: { hrs: 18, min: 45 },
        }]
        for (var i = 0; i < 6; i++) {
            var dia = {
                numeroDia: diaSemana.date(),
                horarios: horarios.map(h => {
                    return {
                        ...h,
                        fecha: diaSemana.hour(h.desde.hrs).minute(h.desde.min).toDate(),
                        pasado: diaSemana.hour(h.desde.hrs).minute(h.desde.min).isBefore(new Date()),
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
            numeroMes,
            mes,
            dias,
            sesiones: Array.from(Array(3).keys()).map(i => {
                return {
                    dia: 0,
                    indiceJornada: -1,
                    fecha: new Date(),
                }
            }),
        })
        setLoadingCalendar(false);
    }

    const handleSelectPlace = async (numeroDia, indiceHorario) => {
        console.log("SELECT", numeroDia, indiceHorario);
        var cal = JSON.parse(JSON.stringify(checkOut));
        const indice = cal.sesiones.findIndex(s => s.dia == 0);
        cal.sesiones[indice].dia = numeroDia;
        cal.sesiones[indice].indiceJornada = indiceHorario;
        const horario = cal.dias.find(d => d.numeroDia == numeroDia).horarios[indiceHorario];
        console.log("HORARIO", horario, cal.dias.find(d => d.numeroDia == numeroDia));
        cal.sesiones[indice].fecha = horario.fecha;
        if (indice == cal.sesiones.length - 1) {
            cal.sesionesOk = true;
        }
        console.log("NC!->", cal);
        setCheckOut(cal);
    }

    const handleDateConfirmed = async () => {
        console.log("ODA", productId, "..")
        const resp = await fetch('/api/checkout', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sessionId,
                productId: productId,
                sessions: checkOut.sesiones,
            })
        })
        setConfirmando(true);
        const r = await resp.json();
        console.log("RESP", r);
        window.location = `${r.url}?token_ws=${r.token}`
    }

    const checkPayment = async () => {
        const token_ws = params.get('token_ws');
        if (token_ws != null && token_ws != undefined) {
            const nc = JSON.parse(JSON.stringify(checkOut));
            nc.productId = productId;
            nc.sesionesOk = true;
            nc.sesionesConfirmadas = true;
            nc.productoConfirmado = true;
            const verification = await fetch(`/api/verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token_ws
                })
            });
            const respVerify = await verification.json();
            console.log("RESP-Verification", respVerify)
            if (respVerify.vci == "TSY") {
                nc.payment = respVerify;
            } else {
                nc.paymentError = true;
            }
            setCheckOut(nc);
        } else initCalendario();
    }

    const initData = useRef(false);
    useEffect(() => {
        if (!initData.current) {
            initData.current = true
            checkPayment();
        }
    }, []);

    return <>
        <div className="max-w-screen-lg m-auto bg-white overflow-x-hidden pb-24">

            <div className="flex w-full pt-8 pb-4">
                <div className={`flex w-1/3 ${session?.user ? 'bg-white' : 'bg-transparent'} text-[#EE64C5] rounded-2xl rounded-r-none justify-center h-10`}>
                    <div>
                        {session?.user ? <FaCheckCircle className="text-lime-500 mt-0.5" size="2rem" /> : <p className="rounded-full bg-pink-700 text-pink-300 h-8 w-8 pl-2.5 pt-1 mt-1 ml-10 font-extrabold">1</p>}
                    </div>
                    <p className="font-extrabold text-2xl ml-4 mt-1">
                        {session?.user ? 'Identificado' : 'Quién eres'}
                    </p>
                </div>
                <div className={`flex w-1/3 border-r-4 border-l-4 border-white justify-center h-10 ${checkOut?.sesionesOk ? 'bg-white' : 'bg-transparent'} text-[#EE64C5]`}>
                    <div>
                        {checkOut?.sesionesOk ? <FaCheckCircle className="text-lime-500 mt-0.5" size="2rem" /> : <p className="rounded-full bg-pink-700 text-pink-300 h-8 w-8 pl-2.5 pt-1 mt-1 ml-10 font-extrabold">2</p>}
                    </div>
                    <p className="font-extrabold text-2xl ml-4 mt-1">Fecha / Producto</p>
                </div>
                <div className={`flex w-1/3 justify-center h-10 ${checkOut?.productoConfirmado ? 'bg-white rounded-r-xl' : 'bg-transparent'} text-[#EE64C5]`}>
                    <div>
                        {checkOut?.productoConfirmado ? <FaCheckCircle className="text-lime-500 mt-0.5" size="2rem" /> : <p className="rounded-full bg-pink-700 text-pink-300 h-8 w-8 pl-2.5 pt-1 mt-1 ml-10 font-extrabold">3</p>}
                    </div>
                    <p className="font-extrabold text-2xl ml-4 mt-1">Pago</p>
                </div>
            </div>

            <div className="w-full left-0 top-20 h-full overflow-hidden">
                <form className="bg-[#f2f2f2] text-[#A4A5A1] rounded-3xl mt-6 p-6 mx-auto w-[852px]">
                    {!session?.user && <>
                        <h1 className="text-3xl text-center mb-4">
                            <span className="cursor-pointer hover:text-blue-500 hover:underline" onClick={() => { toggleRegistration(false) }}>Identifícate</span> ó&nbsp;
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
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-xl border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="email" className="absolute text-sm text-gray-300 dark:text-white duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#6E4A26] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-white peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    e-mail</label>
                            </div>
                            {errors.email && <div className="text-red-400 w-[260px] text-sm mx-auto my-0 pb-2 pl-2"><span>Ingrese un email válido</span></div>}
                            <div className="relative border-2 rounded-xl border-gray-300 focus:border-blue-600 w-[260px] mx-auto mt-4">
                                <input type={passwordVisible ? 'text' : 'password'}
                                    {...register('password', { required: true })}
                                    id="password"
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-xl border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="password" className="absolute text-sm text-gray-300 dark:text-white duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#6E4A26] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-white peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
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
                                    className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white bg-transparent rounded-xl border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                                <label htmlFor="repassword" className="absolute text-sm text-gray-300 dark:text-white duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#6E4A26] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-white peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">
                                    re-password</label>
                                <div className="absolute right-3 top-2.5 cursor-pointer" onClick={() => { setRepasswordVisible(!repasswordVisible) }}>
                                    {repasswordVisible ? <FaEye size="1.5rem" /> : <FaEyeSlash size="1.5rem" />}
                                </div>
                            </div>}
                            {errors.repassword && <div className="text-red-400 w-[260px] text-sm mx-auto my-0 pb-2 pl-2"><span>Re-password obligatorio</span></div>}

                            <div className="button-container">
                                <button onClick={handleSubmit(identificationHandler)}
                                    className="w-[260px] btn border-solid border-2 border-[#EE64C5] rounded-lg relative overflow-hidden bg-[#EE64C5] font-extrabold text-2xl py-1 px-9">
                                    {registrationMode ? 'REGISTRAR' : 'ENTRAR'}
                                </button>
                            </div>
                            <div className="button-container">
                                <button className="w-[260px] flex justify-center btn border-solid border-2 border-slate-400 rounded-lg relative overflow-hidden bg-white font-extrabold text-2xl py-1 px-9 text-slate-500">
                                    <TbBrandGoogleFilled className="mr-2" size="2rem" /> Google
                                </button>
                            </div>
                            <div className="button-container">
                                <button onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-[260px] flex justify-center btn border-solid border-2 border-blue-400 rounded-lg relative overflow-hidden bg-blue-300 text-slate-100 font-extrabold text-2xl py-1 px-9">
                                    <FaMeta className="mr-2" size="2rem" /> Meta
                                </button>
                            </div>
                        </div> :
                            <Loader />}
                    </>}

                    {(session?.user && !checkOut.sesionesConfirmadas && !checkOut.productoConfirmado) && <>
                        <h1 className="text-3xl text-center mb-4">
                            <span className="cursor-pointer text-blue-500 underline">Fecha</span> /&nbsp;
                            <span>Producto</span>
                        </h1>
                        <div className="w-full flex justify-center">
                            <div className="w-[80px] h-20 border-2 border-slate-400 bg-transparent hover:bg-slate-300 cursor-pointer rounded-md mx-2 mt-10 hover:text-slate-700">
                                <MdNavigateBefore className="mr-2 pt-4 " size="4rem" />
                            </div>
                            {!loadingCalendar && checkOut.dias.map((d, indice) => {
                                return (<div className={`w-[420px] space-y-2`} key={`_${d.numeroDia}`}>
                                    <div className={`border-slate-400 bg-slate-300 text-slate-600 border- border-2 rounded-md text-center mr-2 text-xl py-1`}>{d.nombreDia}<span className="text-3xl font-bold">&nbsp;{d.numeroDia}</span></div>
                                    {d.horarios.map((h, indice) => <div onClick={() => handleSelectPlace(d.numeroDia, indice)}
                                        key={`_${d.numeroDia}_${indice}`}
                                        className={`${d.pasado ? 'border-slate-500 cursor-not-allowed text-slate-500' : h.ocupado ? 'border-red-400 bg-pink-300 text-[#EE64C5] cursor-not-allowed' : 'border-[#A4A5A1] hover:bg-white hover:text-slate-500 cursor-pointer'} text-md font-bold border-2 rounded-md text-center mr-2 py-1`}>
                                        <span>{h.desde.hrs < 10 && '0'}{h.desde.hrs}</span><span className="relative text-xs -top-1 ml-0.5">{h.desde.min == 0 && '0'}{h.desde.min}</span>/
                                        <span>{h.hasta.hrs < 10 && '0'}{h.hasta.hrs}</span><span className="relative text-xs -top-1 ml-0.5">{h.hasta.min == 0 && '0'}{h.hasta.min}</span></div>)}
                                </div>)
                            })}

                            {loadingCalendar && <div className="w-[480px] h-80 pt-32"><Loader /></div>}

                            <div className="w-[80px] h-20 border-2 border-slate-400 bg-transparent hover:bg-slate-300 cursor-pointer rounded-md mt-10 hover:text-slate-700">
                                <MdNavigateNext className="mr-2 pt-4 " size="4rem" />
                            </div>
                        </div>

                        <p className="text-xl mt-4 uppercase tracking-widest">
                            {checkOut.sesionesOk ? `Sesiones listas. Presiona continuar` : `Selecciones sus ${checkOut?.sesiones?.length} sesiones`}
                        </p>
                        <div className="w-full flex px-20">
                            {checkOut?.sesiones?.map((s, index) =>
                                <div key={`${s.numeroDia}_${s.indiceJornada}_${index}`} className="border-2 border-slate-400 rounded-md p-1 m-2 w-1/3">
                                    <p className="uppercase tracking-widest font-bold text-[#EE64C5]">Sesión {index + 1}</p>
                                    <p className="text-bold">{s.dia != 0 ? dayjs(s.fecha).format("DD/MMM/YY HH:mm") : '--/--/-- --:--'}</p>
                                </div>
                            )}
                        </div>

                        {(!checkOut.sesionesConfirmadas && checkOut.sesionesOk) ? <div className="flex space-x-2 justify-center">
                            <div className="button-container">
                                <button onClick={() => {
                                    var cal = JSON.parse(JSON.stringify(checkOut));
                                    cal.sesionesOk = false;
                                    setCheckOut(cal);
                                }}
                                    className="w-[260px] btn flex border-solid border-2 border-pink-300 rounded-lg relative overflow-hidden bg-[#EE64C5] text-2xl py-1 px-9">
                                    <MdNavigateBefore className="mr-2" size="2rem" /> VOLVER
                                </button>
                            </div>
                            <div className="button-container">
                                <button onClick={() => {
                                    var cal = JSON.parse(JSON.stringify(checkOut));
                                    cal.sesionesConfirmadas = true;
                                    setCheckOut(cal);
                                }}
                                    className="w-[260px] flex justify-center btn border-solid border-2 border-slate-400 rounded-lg relative overflow-hidden bg-white font-extrabold text-2xl py-1 px-9 text-slate-500">
                                    Continuar <MdNavigateNext className="mr-2" size="2rem" />
                                </button>
                            </div>
                        </div> :
                            (confirmando && <Loader />)}
                    </>}

                    {(checkOut.sesionesConfirmadas && !checkOut.productoConfirmado) && <>
                        <h1 className="text-3xl text-center mb-4">
                            <span>Fecha</span> /&nbsp;
                            <span className="cursor-pointer text-blue-500 underline">Producto</span>
                        </h1>
                        <div className="w-full flex">
                            <div className="w-2/5 text-center">
                                <img src="/camara_hiperbalica.png" className="rounded-md w-full" />
                            </div>
                            <div className="w-3/5 ml-4">
                                <div className="w-full ml-6">
                                    <p className="text-left text-xl uppercase tracking-widest text-[#EE64C5]">Cámara hiperbálica</p>
                                    <p className="text-left pr-16">Éstas son sus sesiones. Confirmelas para reservar con su pago o vuelva para seleccionarlas nuevamente</p>
                                </div>
                                <div className="w-full flex px-4">
                                    {checkOut?.sesiones?.map((s, index) =>
                                        <div key={`${s.numeroDia}_${s.indiceJornada}_${index}`} className="border-2 border-pink-300 bg-[#EE64C5] text-white rounded-md p-1 m-2 w-1/3">
                                            <p className="font-bold uppercase tracking-widest">Sesión {index + 1}</p>
                                            <p className="text-xs">{s.dia != 0 ? dayjs(s.fecha).format("DD/MMM/YYYY HH:mm") : '--/--/-- --:--'}</p>
                                        </div>
                                    )}
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
                                    console.log("POR ACA...");
                                    handleDateConfirmed()
                                    e.preventDefault();
                                }}
                                    className="w-[260px] flex justify-center text-[#A4A5A1] btn border-solid border-2 border-pink-300 rounded-lg relative overflow-hidden bg-white text-2xl py-1 px-9">
                                    Confirmar <MdNavigateNext className="mr-2" size="2rem" />
                                </button>
                            </div>
                        </div> :
                            <Loader />}
                    </>}

                    {checkOut.productoConfirmado && <>
                        <h1 className="text-3xl text-center mb-4">Pago</h1>
                        <p>Tu pago fue exitoso</p>
                        {checkOut.payment && <>
                            <p>{`Tarjeta  : **** **** ${checkOut.payment.cardNumber}`}</p>
                            <p>{`Fecha    : ${dayjs(checkOut.payment.transactionDate).format('DD/MMM/YYYY HH:mm')}`}</p>
                            <p>{`Monto    : $ ${numberFormat(checkOut.payment.amount)}`}</p>
                            <p>{`N° orden : ${checkOut.payment.orderNumber}`}</p>
                            <Link href="/"
                                className="w-[260px] btn flex border-solid border-2 border-[#EE64C5] rounded-lg relative overflow-hidden bg-[#EE64C5] font-extrabold text-2xl py-1 px-12 text-center">Home</Link>
                        </>}
                        {checkOut.paymentError && <>
                            <p className="text-[#EE64C5]">`Error!!!`</p>
                        </>}
                        {confirmando && <Loader />}
                    </>}
                </form>
            </div>
        </div>
    </>
}