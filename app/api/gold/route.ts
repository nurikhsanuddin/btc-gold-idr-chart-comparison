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
      where: { type: "gold" },
      orderBy: { date: "desc" },
    });

    const hasFetchedToday = latestFetch && isSameDay(latestFetch.date, today);

    if (hasFetchedToday) {
      // Get data from the database
      const cachedData = await prisma.priceData.findMany({
        where: { assetType: "gold" },
        orderBy: { date: "asc" },
      });

      return NextResponse.json({
        data: cachedData.map((item) => ({
          date: item.date,
          gold: item.price,
        })),
        source: "database",
      });
    }

    // Fetch from API
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=GLD&apikey=${API_KEY}`
    );
    const timeSeries = response.data["Time Series (Daily)"];

    if (!timeSeries) {
      throw new Error("Data emas tidak tersedia");
    }

    const dates = Object.keys(timeSeries).sort().slice(-365);
    const data = dates.map((date) => ({
      date,
      gold: parseFloat(timeSeries[date]["4. close"]),
    }));

    // Store data in database
    await Promise.all(
      data.map((item) =>
        prisma.priceData.upsert({
          where: {
            date_assetType: {
              date: item.date,
              assetType: "gold",
            },
          },
          update: { price: item.gold },
          create: {
            date: item.date,
            assetType: "gold",
            price: item.gold,
          },
        })
      )
    );

    // Log the fetch
    await prisma.fetchLog.create({
      data: { type: "gold", date: new Date() },
    });

    return NextResponse.json({
      data,
      source: "api",
    });
  } catch (error: any) {
    console.error("Error fetching Gold data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Gold data" },
      { status: 500 }
    );
  }
}
