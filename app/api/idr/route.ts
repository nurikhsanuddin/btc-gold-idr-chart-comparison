import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { isSameDay } from "date-fns";

const prisma = new PrismaClient();
const API_KEY = "52BD7DBHHT690E38";

export async function GET() {
  try {
    // Check if data has been fetched today
    const today = new Date();
    const latestFetch = await prisma.fetchLog.findFirst({
      where: { type: "idr" },
      orderBy: { date: "desc" },
    });

    const hasFetchedToday = latestFetch && isSameDay(latestFetch.date, today);

    if (hasFetchedToday) {
      // Get data from the database
      const cachedData = await prisma.priceData.findMany({
        where: { assetType: "idr" },
        orderBy: { date: "asc" },
      });

      return NextResponse.json({
        data: cachedData.map((item) => ({
          date: item.date,
          idr: item.price,
        })),
        source: "database",
      });
    }

    // Fetch from API
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=IDR&apikey=${API_KEY}`
    );
    const timeSeries = response.data["Time Series FX (Daily)"];

    if (!timeSeries) {
      throw new Error("Data IDR tidak tersedia");
    }

    const dates = Object.keys(timeSeries).sort().slice(-365);
    const data = dates.map((date) => ({
      date,
      idr: 1 / parseFloat(timeSeries[date]["4. close"]),
    }));

    // Store data in database
    await Promise.all(
      data.map((item) =>
        prisma.priceData.upsert({
          where: {
            date_assetType: {
              date: item.date,
              assetType: "idr",
            },
          },
          update: { price: item.idr },
          create: {
            date: item.date,
            assetType: "idr",
            price: item.idr,
          },
        })
      )
    );

    // Log the fetch
    await prisma.fetchLog.create({
      data: { type: "idr", date: new Date() },
    });

    return NextResponse.json({
      data,
      source: "api",
    });
  } catch (error: any) {
    console.error("Error fetching IDR data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch IDR data" },
      { status: 500 }
    );
  }
}
