import axios from "axios";
import { prisma } from "./prisma";
import { format, isSameDay, parseISO } from "date-fns";

// Check if data has been fetched today
async function hasDataBeenFetchedToday(type: string): Promise<boolean> {
  const today = new Date();

  // Get the latest fetch log for this data type
  const latestFetch = await prisma.fetchLog.findFirst({
    where: { type },
    orderBy: { date: "desc" },
  });

  if (!latestFetch) return false;

  // Check if the latest fetch was today
  return isSameDay(latestFetch.date, today);
}

// Log that data has been fetched
async function logDataFetch(type: string): Promise<void> {
  await prisma.fetchLog.create({
    data: { type, date: new Date() },
  });
}

// Get BTC data
export async function getBTCData(apiKey: string) {
  const hasFetchedToday = await hasDataBeenFetchedToday("btc");

  if (hasFetchedToday) {
    console.log("Using cached BTC data from database...");
    // Get data from the database
    const cachedData = await prisma.priceData.findMany({
      where: { assetType: "btc" },
      orderBy: { date: "asc" },
    });

    return cachedData.map((item) => ({
      date: item.date,
      btc: item.price,
    }));
  }

  // Fetch data from API
  console.log("Fetching fresh BTC data from API...");
  const response = await axios.get(
    `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=BTC&market=USD&apikey=${apiKey}`
  );
  const timeSeries = response.data["Time Series (Digital Currency Daily)"];

  if (!timeSeries) {
    throw new Error("Data BTC tidak tersedia");
  }

  const dates = Object.keys(timeSeries).sort().slice(-365);
  const data = dates.map((date) => ({
    date,
    btc: parseFloat(timeSeries[date]["4. close"]),
  }));

  // Store data in database
  await prisma.$transaction(
    data.map((item) =>
      prisma.priceData.upsert({
        where: {
          date_assetType: {
            date: item.date,
            assetType: "btc",
          },
        },
        update: { price: item.btc },
        create: {
          date: item.date,
          assetType: "btc",
          price: item.btc,
        },
      })
    )
  );

  // Log the fetch
  await logDataFetch("btc");

  return data;
}

// Get Gold data
export async function getGoldData(apiKey: string) {
  const hasFetchedToday = await hasDataBeenFetchedToday("gold");

  if (hasFetchedToday) {
    console.log("Using cached Gold data from database...");
    // Get data from the database
    const cachedData = await prisma.priceData.findMany({
      where: { assetType: "gold" },
      orderBy: { date: "asc" },
    });

    return cachedData.map((item) => ({
      date: item.date,
      gold: item.price,
    }));
  }

  // Fetch data from API
  console.log("Fetching fresh Gold data from API...");
  const response = await axios.get(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=GLD&apikey=${apiKey}`
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
  await prisma.$transaction(
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
  await logDataFetch("gold");

  return data;
}

// Get IDR data
export async function getIDRData(apiKey: string) {
  const hasFetchedToday = await hasDataBeenFetchedToday("idr");

  if (hasFetchedToday) {
    console.log("Using cached IDR data from database...");
    // Get data from the database
    const cachedData = await prisma.priceData.findMany({
      where: { assetType: "idr" },
      orderBy: { date: "asc" },
    });

    return cachedData.map((item) => ({
      date: item.date,
      idr: item.price,
    }));
  }

  // Fetch data from API
  console.log("Fetching fresh IDR data from API...");
  const response = await axios.get(
    `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=USD&to_symbol=IDR&apikey=${apiKey}`
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
  await prisma.$transaction(
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
  await logDataFetch("idr");

  return data;
}
