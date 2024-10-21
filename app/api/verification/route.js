import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import Catalog from "@/models/Catalog";
import Schedule from "@/models/Schedule";
import Specialist from "@/models/Specialist";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { ORDER_STATUS } from "@/lib/constants";

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
          console.log("Al menos entra por acá");

          const catalog = await Catalog.findOne({ id: body.catalogId });

          const specialists = await Specialist.find({ active: true }).lean();
          const specialistSchedules = await Schedule.find({
            specialistId: { $in: specialists.map(s => s._id) },
            startDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }).lean();

          const specialistLoad = specialists.map(specialist => {
            const schedules = specialistSchedules.filter(schedule => schedule.specialistId.toString() === specialist._id.toString());
            const totalMinutes = schedules.reduce((acc, schedule) => acc + schedule.duration, 0);
            return { specialistId: specialist._id, totalMinutes };
          });

          specialistLoad.sort((a, b) => a.totalMinutes - b.totalMinutes);

          const selectedSpecialists = specialistLoad.slice(0, catalog.specialistQty).map(s => s.specialistId);

          console.log("RESP TSY");
          for (let i = 0; i < body.sessions.length; i++) {
            const sesion = body.sesiones[i];
            const reserva = {
              specialistsId: selectedSpecialists,
              clientId: body.clientId,
              catalogId: catalog._id,
              startDate: sesion.startDate,
              duration: catalog.durationMins + (catalog.cleanUpMins ?? 0)          
            };
            console.log("CREANDO RESERVA", reserva);
            await Schedule.create(reserva);
          }

          const order = {
            catalogId: catalog._id,
            amount: amount,
            remainingBalance: catalog.price - amount,
            date: new Date(),
            userId: body.clientId,
            status: ORDER_STATUS.created,
            sessions: body.sessions.map(s => ({ 
              from: s.startDate, 
              to: new Date(s.startDate.getTime() + catalog.durationMins * 60 * 1000), 
              assist: false }))
          };
          console.log("CREANDO ORDERN", order);
          await Order.create(order);

          const payment = {
            orderId: order._id,
            buyOrder: resp.buy_order,
            sessionId: resp.session_id,
            amount: resp.amount,
            status: resp.status,
            authorizationCode: resp.authorization_code,
            paymentTypeCode: resp.payment_type_code,
            responseCode: resp.response_code,
            installmentsNumber: resp.installments_number,
            installmentsAmount: resp.installments_amount,
            accountingDate: resp.accounting_date,
            transactionDate: resp.transaction_date,
            vci: resp.vci,
            urlRedirection: resp.url
          };
          console.log("CREANDO PAYMENT", payment);
          await Payment.create(payment);


          const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CALENDAR_API_CLIENTID,
            process.env.GOOGLE_CALENDAR_API_KEY
          );
          oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_CALENDAR_API_REFRESH_TOKEN });

          const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

          const event = {
            summary: 'Reserva de Hora',
            description: 'Reserva de hora confirmada.',
            start: {
              dateTime: new Date("06-06-2024 10:30").toISOString(), // Reemplaza con la fecha y hora real del evento
              timeZone: 'America/Santiago',
            },
            end: {
              dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // Duración de 1 hora
              timeZone: 'America/Santiago',
            },
            attendees: [{ email: process.env.USER_EMAIL }],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
              ],
            },
          };

          // Crear evento en el calendario
          await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
          });

          // Configurar nodemailer
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASS,
            },
          });

          // Enviar correo al usuario
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
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