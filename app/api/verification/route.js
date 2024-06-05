import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import ical from 'ical-generator';

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        console.log("POST Verification", body)
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
          console.log("Al menos entra por acá")

          // Configura el transporte de nodemailer
          const transporter = nodemailer.createTransport({
            service: 'gmail', // O el servicio de correo que uses
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASS,
            },
          });
        
          // Genera el evento de calendario
          const cal = ical({ name: 'My Calendar Event 2' });
          const eventDetails = {
            start: new Date("05-28-2024 10:30"),
            end: new Date("05-28-2024 11:30"),
            summary: "Sesión Hiperbálica",
            description: "Venga liviano de comida, con ropa cómoda suelta y llegue con al menos 10 minutos antes",
            location:{
              title: 'Sessión Hiperbálica',
              address: 'San Martin 946',
              radius: 141.1751386318387,
              geo: {
                  lat: -36.825684,
                  lon: -73.042091
              }, 
           },
            organizer: { name: 'Kskin', email: 'edtronco@gmail.com' },
            attendees: [
              { email: 'contacto@yga.cl', name: 'Eduardo', 
              rsvp: true, role: 'REQ-PARTICIPANT' }
            ],
          }
          cal.createEvent(eventDetails);
        
          const icsContent = cal.toString();
          const adminEmail = "edtronco@gmail.com"
          const clientEmail = "contacto@yga.cl"
        
          function formatGoogleCalendarDate(date) {
            return new Date(date).toISOString().replace(/-|:|\.\d+/g, '');
          }

          // Configura el correo electrónico
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: `${adminEmail}, ${clientEmail}`,
            subject: 'Evento de Calendario',
            text: `<a href="https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(eventDetails.summary)}&dates=${formatGoogleCalendarDate(eventDetails.start)}/${formatGoogleCalendarDate(eventDetails.end)}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}">Acepta</a>`,
            alternatives: [{
              contentType: 'text/calendar',
              content: icsContent,
              method: 'REQUEST',
            }]
          }
          await transporter.sendMail(mailOptions);

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