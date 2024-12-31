import dayjs from "dayjs";
import { useState, useRef, useEffect } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

export const CarrouselDias = ({fecha, setFecha, cargarHorarios}) => {
    const [direccion, setDireccion] = useState(0);
    const [indiceInicial, setIndiceInicial] = useState(1);
    const [transicion, setTransicion] = useState(false);
    const [diasVisibles, setDiasVisibles] = useState([]);
    const timeoutRef = useRef(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            cargarHorarios();
        }, 1000);
    };

    const avanzarDia = () => {
        setDireccion(1);
        setTransicion(false);
        setIndiceInicial((prevIndice) => (prevIndice + 1));
        setTimeout(() => {
            setTransicion(true);
            var nuevoDia = dayjs(fecha).add(1, "days");
            if (nuevoDia.day() === 6) {
                nuevoDia = nuevoDia.add(2, "days");
            }
            setFecha(nuevoDia.toDate());
            initDays(nuevoDia.toDate());
            setIndiceInicial((prevIndice) => (prevIndice - 1));
            resetTimeout();
        }, 300);
    };

    const retrocederDia = () => {
        setDireccion(-1);
        setTransicion(false);
        setIndiceInicial((prevIndice) => (prevIndice - 1));
        setTimeout(() => {
            setTransicion(true);
            var diaTope = dayjs(fecha).add(2, "days").toDate();
            if (dayjs(diaTope).isBefore(dayjs())) {
                console.log("isBefore", diaTope);
                setIndiceInicial((prevIndice) => (prevIndice + 1));
            } else {
                var nuevoDia = dayjs(fecha).add(-1, "days");
                if (nuevoDia.day() === 0) {
                    nuevoDia = nuevoDia.add(-2, "days");
                }
                setIndiceInicial((prevIndice) => (prevIndice + 1));
                setFecha(nuevoDia.toDate());
                initDays(nuevoDia.toDate());
                resetTimeout();
            }
        }, 300);
    };

    const initDays = (fechaInicial) => {
        var dv = [];
        const diaSemana = dayjs(fechaInicial).day();
        var factor = [-4, -5, -5, -5, -3, -3, -2];
        var dia = dayjs(fechaInicial).add(factor[diaSemana], "days");
        for (let i = 0; i < 7; i++) {
            const ds = dia.day();
            if(ds == 6) {
                dia = dia.add(2, "days");
            }
            dv.push({
                numeroDia: dayjs(dia).date(),
                nombreDia: dayjs(dia).format("dd"),
                pasado: dayjs(dia).isAfter(dayjs(new Date())),
                primero: dayjs(dia).add(-1, "days").isAfter(new Date())
            });
            dia = dia.add(1, "days");
        }
        setDiasVisibles(dv);
    }

    const initData = useRef(false);
    useEffect(() => {
        if (!initData.current) {
            initData.current = true
            initDays(fecha);
        }
    }, []);

    const getIndice = () => {
        if (transicion == false) {
            if (direccion == 0) {
                return 3;
            } else if (direccion == 1) {
                return 4;
            }
            return 2;
        } else {
            return 3;
        }
    }

    return (
        <div className="w-full flex justify-center select-none">
            <div
                className={`w-9 h-9 rounded-full border-2 border-slate-400 white hover:bg-slate-300 cursor-pointer mx-2 mt-4 hover:text-slate-700 p-0${dayjs(fecha).add(-2, "days").isBefore(dayjs(new Date())) ? ' invisible' : ''}`}
                onClick={retrocederDia}
            >
                <MdNavigateBefore className="relative -left-1 -top-1" size="2.5rem" />
            </div>

            <div className="w-[480px] flex overflow-hidden">
                <div
                    className={`flex ${!transicion ? "transform transition-transform duration-300 ease-in-out" : ""}`}
                    style={{
                        transform: `translateX(-${indiceInicial * 96}px)`
                    }}
                >
                    {diasVisibles.map((d, indice) => (
                        <div className={`w-[96px] space-y-2 flex-shrink-0`}
                            key={`_${d.numeroDia + d.nombreDia + "_" + indice}`}>
                            {indice === getIndice() ? (
                                <div className="zeylada border-green-500 text-green-500 border-4 rounded-md text-center mr-2 text-md py-1 bg-green-200">
                                    {d.nombreDia}
                                    <p className="text-2xl font-bold">&nbsp;{d.numeroDia}</p>
                                </div>
                            ) : d.pasado ? <div className="zeylada border-slate-400 text-slate-500 border-2 rounded-md text-center mr-2 text-md py-1 mt-[2px]">
                                {d.nombreDia}
                                <p className="text-2xl font-bold">&nbsp;{d.numeroDia}</p>
                            </div> : <div className="zeylada border-slate-200 text-slate-300 border-2 rounded-md text-center mr-2 text-md py-1 mt-[2px]">
                                {d.nombreDia}
                                <p className="text-2xl font-bold">&nbsp;{d.numeroDia}</p>
                            </div>}
                        </div>
                    ))}
                </div>
            </div>

            <div
                className="w-9 h-9 rounded-full border-2 border-slate-400 white hover:bg-slate-300 cursor-pointer mt-4 hover:text-slate-700 p-0"
                onClick={avanzarDia}
            >
                <MdNavigateNext className="relative -left-0.5 -top-1" size="2.5rem" />
            </div>
        </div>
    );
};
