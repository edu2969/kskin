import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";
import { ORDER_STATUS } from "@/lib/constants";
import Catalog from "@/models/catalog";
import Order from "@/models/order";
import dayjs from 'dayjs';

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const session = await getServerSession(authOptions);
    console.log("REQ!", session);
    if (!session) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    console.log("BODY:", body, userId);
    
    const catalog = await Catalog.findOne({ _id: body.catalogId });
    var amount = Math.floor(catalog.price * (body.esAbonado ? .25 : 1));

    const endPoint = '/rswebpaytransaction/api/webpay/v1.2/transactions';
    const tbkCall = await fetch(`${process.env.TBK_INT_HOST}${endPoint}`, {
      method: 'POST',
      headers: {
        'Tbk-Api-Key-Id': process.env.TBK_INT_API_KEY_ID,
        'Tbk-Api-Key-Secret': process.env.TBK_INT_API_KEY_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'buy_order': `KSKIN_SID_${body.sessionId}`,
        'session_id': `SID_${body.sessionId}`,
        'amount': amount,
        'return_url': `${process.env.BASE_URL}/checkout/${body.catalogId}`
      })
    });

    const resp = await tbkCall.json();
    console.log("RESP", resp);

    const lastOrder = await Order.findOne().sort({ date: -1 });
    const newOrderNumber = lastOrder ? lastOrder.number + 1 : 1;
    const order = new Order({
      number: newOrderNumber,
      orderIdentification: `KSKIN_SID_${body.sessionId}`,
      catalogId: catalog._id,
      amount: amount,
      remainingBalance: catalog.price - amount,
      date: new Date(),
      clientId: userId,
      status: ORDER_STATUS.created,
      sessions: body.sessions.map(session => {
        if(session != null) {
          const from = dayjs(session).toDate();
          const to = dayjs(from).add(catalog.durationMins + (catalog.cleanUpMins ?? 0), 'minutes').toDate();
          return {
            from,
            to,
            assist: false
          };
        }
        return {
          from: null,
          to: null,
          assist: false
        }        
      })
    });
    await order.save();
    return NextResponse.json({ ok: true, token: resp.token, url: resp.url });
  } catch (error) {
    console.log("ERROR", error);
    return NextResponse.json({ status: 500, message: "Error", error });
  }
}