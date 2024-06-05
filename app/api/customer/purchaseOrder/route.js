import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import ApiCalendar from "react-google-calendar-api";
import PurchaseOrder from "@/models/purchase-order"
import PurchaseOrderItem from "@/models/purchase-order-item"
import Product from "@/models/product"
import PriceLog from "@/models/price-log"
import User from "@/models/user";

const config = {
  clientId: process.env.GOOGLE_CALENDAR_API_CLIENTID ?? '',
  apiKey: process.env.GOOGLE_CALENDAR_API_KEY ?? '',
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};
const apiCalendar = new ApiCalendar(config);

export async function POST(req) {
  const req = await req.json();
  await connectMongoDB();
  
  return NextResponse.json({ message: "User registered." }, { status: 201 });  
}

export async function GET(req) {
    try {
        await connectMongoDB();
        const pos = await PurchaseOrder.find({ status: { $lt: 3 } });
        var purchaseOrderList = pos.map(po => {
            return {
                id: po._id,
                identifier: po.identifier,
                currency: po.currency,
                totalItems: 0,
                totalAmount: 0,
                requestDate: po.requestReceiptDate,
                status: po.status,
                items: [],
            }
        });
        for(var i = 0; i < pos.length; i++) {
            var items = await PurchaseOrderItem.find({ purchaseOrderId: pos[i]._id });
            purchaseOrderList[i].totalItems += items.reduce((p, c) => p + c.quantity, 0);
            purchaseOrderList[i].totalAmount += items.reduce((p, c) => p + c.netAmount, 0);
            for(var j = 0; j < items.length; j++) {                
                const item = items[j];
                const product = await Product.findOne({ _id: item.productId });
                purchaseOrderList[i].items[j] = {                    
                    lineNumber: item.lineNumber,
                    identifier: item.identifier,
                    productName: product.name,
                    description: product.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                    netAmount: item.netAmount,
                }                
            }            
        }        
        return NextResponse.json({ purchaseOrders: purchaseOrderList });
    } catch(error) {
        console.error("ERROR", error);
        return NextResponse.json({ message: "Error", error });
    }
}

export async function POST(req) {
    try {
        await connectMongoDB();
        const poc = await req.json();        
            console.log("POC", poc);
            var purchaseOrder = await PurchaseOrder.findOne({
                number: poc.number
            });
            if(!purchaseOrder) {
                purchaseOrder = await PurchaseOrder.create({
                    number: poc.number,
                    status: poc.status,
                    currency: poc.currency,
                    userId: poc.userId,
                    termsOfPayment: poc.termsOfPayment,
                    createdAt: new Date(),
                })
            }
            for(var j = 0; j < poc.items.length; j++) {
                var item = poc.items[j];
                var product = await Product.findOne({
                    identifier: item.identifier,
                });
                if(!product) {
                    product = await Product.create({
                        identifier: item.identifier,
                        name: item.productName,
                        unit: item.unit,
                        description: item.description,
                        stockRanges: {
                            min: 0,
                            max: item.quantity,
                        }
                    })
                }
                var priceLog = await PriceLog.findOne({
                    productId: product._id,
                }).sort({
                    date: -1,
                })
                if(!priceLog || item.unitPrice != priceLog.value) {
                    priceLog = await PriceLog.create({
                        productId: product._id,
                        date: new Date(),
                        value: item.unitPrice,
                        currency: purchaseOrder.currency,
                    })
                }
                var poi = await PurchaseOrderItem.findOne({
                    lineNumber: j + 1,
                    purchaseOrderId: purchaseOrder._id
                });
                if(!poi) {
                    poi = await PurchaseOrderItem.create({                    
                        purchaseOrderId: purchaseOrder._id,
                        identifier: item.identifier,
                        lineNumber: j + 1,
                        productId: product._id,
                        quantity: item.quantity,
                        unit: item.unit,
                        unitPrice: item.unitPrice,
                        netAmount: item.netAmount,
                    })
                }
            }         
        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.status(500).json({ message: "Error", error });
    }
}