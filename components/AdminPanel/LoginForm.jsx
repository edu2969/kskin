'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signIn } from "next-auth/react"
import { Loader } from '../Loader';

export const LoginForm = ({ session }) => {
    const [login, setLogin] = useState(false); 
    const {
        register,
        formState: {
            errors
        },
        handleSubmit,
    } = useForm();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [repasswordVisible, setRepasswordVisible] = useState(false);
    const [registrationMode, setRegistrationMode] = useState(false);
    
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
    
    return <div className="absolute w-full left-0 top-48 h-screen overflow-hidden">
        <form className="relative z-30 bg-white mt-28 p-6 mx-auto shadow w-[860px] rounded-lg full-shadow">
            {!session?.user && <>
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
                </div> :
                    <Loader text="Cargando"/>}                        
            </>}
        </form>
    </div>
}