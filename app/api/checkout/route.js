import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    console.log("POST transactions", body);

    const endPoint = '/rswebpaytransaction/api/webpay/v1.2/transactions';
    const tbkCall = await fetch(`${process.env.TBK_INT_HOST}${endPoint}`, {
      method: 'POST',
      headers: {
        'Tbk-Api-Key-Id': process.env.TBK_INT_API_KEY_ID,
        'Tbk-Api-Key-Secret': process.env.TBK_INT_API_KEY_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'buy_order': `MSJ_PLUS01_${body.sessionId}`,
        'session_id': `SDI_${body.sessionId}`,
        'amount': 49990,
        'return_url': `${process.env.BASE_URL}/agenda/${body.productId}`
      })
    });

    const resp = await tbkCall.json();

    if (resp.cvi === 'TSY') {
      // Configurar OAuth2 client
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
          <p>Ubicación: 123 Main St, City, Country</p>
          <p>Fecha: ${new Date().toISOString()}</p>
        `,
      });
    }

    return NextResponse.json({ ok: true, token: resp.token, url: resp.url });
  } catch (error) {
    return NextResponse.status(500).json({ message: "Error", error });
  }
}