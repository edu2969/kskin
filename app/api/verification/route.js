import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import Schedule from "@/models/schedule";
import Catalog from "@/models/catalog";
import Specialist from "@/models/specialist";
import Order from "@/models/order";
import Payment from "@/models/payment";
import { ORDER_STATUS } from "@/lib/constants";
import dayjs from 'dayjs';
import User from "@/models/user";

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        console.log("POST Verification -------->", body)
        const endPoint = '/rswebpaytransaction/api/webpay/v1.2/transactions'
        const tbkCall = await fetch(`${process.env.TBK_INT_HOST}${endPoint}/${body.token}`, {
          method: 'PUT',
          headers: {
            'Tbk-Api-Key-Id': process.env.TBK_INT_API_KEY_ID,
            'Tbk-Api-Key-Secret': process.env.TBK_INT_API_KEY_SECRET,
            'Content-Type': 'application/json',
          },
        })
        const resp = await tbkCall.json();        
        console.log("RESPUESTA TBK-transactions 2.1 ----->", resp);
        if(resp.vci == "TSY") {
          var order = await Order.findOne({ orderIdentification: resp.buy_order });
          console.log("ORDER", order);
          if(order.status == ORDER_STATUS.confirmed) {
            return NextResponse.json({ 
              ok: true,
              cardNumber: resp.card_detail.card_number,
              transactionDate: resp.transaction_date,
              orderNumber: resp.buy_order,
              vci: resp.vci,
              amount: resp.amount,
            });
          }
          
          const catalog = await Catalog.findOne({ _id: body.catalogId });
          const specialists = await Specialist.find({ 
            specialtyIds: catalog.specialtyId,
            active: true 
          }).lean();
          console.log("ACTIVOS", specialists);

          const specialistSchedules = await Schedule.find({
            specialistId: { $in: specialists.map(s => s._id) },
            active: true
          }).lean();
          console.log("SCHEDULES", specialistSchedules);

          const specialistLoad = specialists.map(specialist => {
            const schedules = specialistSchedules.filter(schedule => schedule.specialistId === specialist._id);
            const totalMinutes = schedules.reduce((acc, schedule) => acc + schedule.duration, 0);
            return { specialistId: specialist._id, totalMinutes };
          });
          console.log("SPECIALISTS LOADED ---->", specialistLoad);

          specialistLoad.sort((a, b) => a.totalMinutes - b.totalMinutes);
          const selectedSpecialists = specialistLoad.slice(0, catalog.specialistQty ?? 1).map(s => s.specialistId);
          console.log("SELECTED SPECIALISTS ---->", selectedSpecialists);

          for (let i = 0; i < order.sessions.length; i++) {
            const sesion = order.sessions[i];
            if(sesion.from != null) {
              const reserva = {
                specialistIds: selectedSpecialists,
                orderId: order._id,
                clientId: order.clientId,
                catalogId: order.catalogId,
                startDate: dayjs(sesion.from).toDate(),
                duration: catalog.durationMins + (catalog.cleanUpMins ?? 0)
              };
              await Schedule.create(reserva);
            }            
          }
          order.status = ORDER_STATUS.confirmed;
          await order.save();

          const payment = {
            gateway: "Transbank",
            orderId: order._id,
            cardNumber: resp.card_detail.card_number,
            methodType: resp.payment_type_code,
            transactionDate: resp.transaction_date,
            orderNumber: resp.buy_order,
            amount: resp.amount,
          };
          await Payment.create(payment);

          // Configurar nodemailer
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASS,
            },
          });

          const client = await User.findOne({ _id: order.clientId }).lean();
          // Enviar correo al usuario
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: client.email,
            subject: 'Reserva de Hora Confirmada',
            html: `
              <p>Su reserva de hora ha sido confirmada y agregada a su calendario.</p>
              <p>Detalles del evento:</p>
              <p>Resumen: Reserva de Hora</p>
              <p>Descripción: Reserva de hora confirmada.</p>
              <p>Ubicación: Cocharne 1298, oficina 102, 1er piso.</p>
              <p>Fecha: ${new Date().toISOString()}</p>
            `,
          });

          return NextResponse.json({ 
            ok: true,
            cardNumber: resp.card_detail.card_number,
            transactionDate: resp.transaction_date,
            orderNumber: resp.buy_order,
            vci: resp.vci,
            amount: resp.amount,
          });
        } else return NextResponse.status(500).json({ message: "Error" + resp.vci });
    } catch (error) {
      console.log("ERROR ---->", error);
      return NextResponse.status(500).json({ message: "Error", error });
    }
}