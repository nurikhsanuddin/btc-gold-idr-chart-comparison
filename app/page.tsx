"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, TrendingUp, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function Home() {
  const [chartData, setChartData] = useState<
    {
      date: string;
      btc: number | null;
      gold: number | null;
      idr: number | null;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("1year");
  const [dataSource, setDataSource] = useState<string>("loading");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setDataSource("loading");

      // Call the API endpoints instead of using Prisma directly
      const [btcResponse, goldResponse, idrResponse] = await Promise.all([
        axios.get("/api/btc"),
        axios.get("/api/gold"),
        axios.get("/api/idr"),
      ]);

      const btcData = btcResponse.data.data;
      const goldData = goldResponse.data.data;
      const idrData = idrResponse.data.data;

      // Determine source (use the "most fresh" source - if any came from API, consider it API data)
      const source =
        btcResponse.data.source === "api" ||
        goldResponse.data.source === "api" ||
        idrResponse.data.source === "api"
          ? "api"
          : "database";

      setDataSource(source);

      // Process and combine data (same as before)
      const allDates = [
        ...new Set([
          ...btcData.map((d: any) => d.date),
          ...goldData.map((d: any) => d.date),
          ...idrData.map((d: any) => d.date),
        ]),
      ].sort();

      const combinedData = allDates.map((date) => ({
        date,
        btc: btcData.find((d: any) => d.date === date)?.btc || null,
        gold: goldData.find((d: any) => d.date === date)?.gold || null,
        idr: idrData.find((d: any) => d.date === date)?.idr || null,
      }));

      // Normalize data (starting from 100)
      const firstValidEntry = combinedData.find(
        (item) => item.btc !== null && item.gold !== null && item.idr !== null
      );

      if (!firstValidEntry) {
        throw new Error("Tidak cukup data yang sesuai.");
      }

      const normalizedData = combinedData
        .filter(
          (item) => item.btc !== null && item.gold !== null && item.idr !== null
        )
        .map((item) => ({
          date: new Date(item.date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          }),
          btc: item.btc ? (item.btc / firstValidEntry.btc!) * 100 : null,
          gold: item.gold ? (item.gold / firstValidEntry.gold!) * 100 : null,
          idr: item.idr ? (item.idr / firstValidEntry.idr!) * 100 : null,
        }));

      // Filter based on selected time range
      let filteredData = normalizedData;
      if (timeRange === "6months") {
        filteredData = normalizedData.slice(-180);
      } else if (timeRange === "3months") {
        filteredData = normalizedData.slice(-90);
      }

      setChartData(filteredData);
    } catch (err: any) {
      console.error("Error in fetchData:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Terjadi kesalahan dalam mengambil data."
      );
      setDataSource("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const getPerformanceClass = (value: number | null) => {
    if (value === null) return "";
    return value >= 100 ? "text-emerald-500" : "text-rose-500";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-card border shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Performa Aset
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Perbandingan performa Bitcoin, Emas, dan Rupiah terhadap USD
                (basis 100%)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {dataSource === "database" && (
                <Badge variant="outline" className="gap-1 border-blue-500">
                  <Database className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-500">Data dari Cache</span>
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData()}
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal memuat data</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Tabs
            defaultValue="1year"
            value={timeRange}
            onValueChange={setTimeRange}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="1year">1 Tahun</TabsTrigger>
                <TabsTrigger value="6months">6 Bulan</TabsTrigger>
                <TabsTrigger value="3months">3 Bulan</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={timeRange} className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-[400px] w-full" />
                </div>
              ) : chartData.length > 0 ? (
                <div className="chart-container" style={{ height: "450px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        domain={[
                          (dataMin: number) =>
                            Math.max(0, Math.floor(dataMin * 0.9)),
                          (dataMax: number) => Math.ceil(dataMax * 1.1),
                        ]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(2)}%`,
                          "",
                        ]}
                        labelFormatter={(label) => `Tanggal: ${label}`}
                        contentStyle={{
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="btc"
                        name="Bitcoin"
                        stroke="#F7931A"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="gold"
                        name="Emas (GLD)"
                        stroke="#FFD700"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="idr"
                        name="IDR/USD"
                        stroke="#CC0000"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">
                    Tidak ada data tersedia
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Silakan coba refresh atau periksa kembali nanti
                  </p>
                </div>
              )}

              {!isLoading && chartData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card className="bg-card/50 backdrop-blur border">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="h-3 w-3 rounded-full bg-[#F7931A] mr-2"></div>
                          <h3 className="font-medium">Bitcoin</h3>
                        </div>
                        <p
                          className={`text-2xl font-bold ${getPerformanceClass(
                            chartData[chartData.length - 1]?.btc
                          )}`}
                        >
                          {chartData[chartData.length - 1]?.btc?.toFixed(2) ||
                            "N/A"}
                          %
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chartData[chartData.length - 1]?.btc &&
                          chartData[0]?.btc
                            ? (chartData[chartData.length - 1]?.btc ?? 0) >=
                              (chartData[0]?.btc ?? 0)
                              ? "Naik"
                              : "Turun"
                            : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur border">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="h-3 w-3 rounded-full bg-[#FFD700] mr-2"></div>
                          <h3 className="font-medium">Emas (GLD)</h3>
                        </div>
                        <p
                          className={`text-2xl font-bold ${getPerformanceClass(
                            chartData[chartData.length - 1]?.gold
                          )}`}
                        >
                          {chartData[chartData.length - 1]?.gold?.toFixed(2) ||
                            "N/A"}
                          %
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chartData[chartData.length - 1]?.gold &&
                          chartData[0]?.gold
                            ? (chartData[chartData.length - 1]?.gold ?? 0) >=
                              (chartData[0]?.gold ?? 0)
                              ? "Naik"
                              : "Turun"
                            : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur border">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="h-3 w-3 rounded-full bg-[#CC0000] mr-2"></div>
                          <h3 className="font-medium">IDR/USD</h3>
                        </div>
                        <p
                          className={`text-2xl font-bold ${getPerformanceClass(
                            chartData[chartData.length - 1]?.idr
                          )}`}
                        >
                          {chartData[chartData.length - 1]?.idr?.toFixed(2) ||
                            "N/A"}
                          %
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chartData[chartData.length - 1]?.idr &&
                          chartData[0]?.idr
                            ? (chartData[chartData.length - 1]?.idr ?? 0) >=
                              (chartData[0]?.idr ?? 0)
                              ? "Naik"
                              : "Turun"
                            : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-0">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {dataSource === "database"
              ? "Data diambil dari cache lokal untuk menghemat kuota API"
              : dataSource === "api"
              ? "Data baru diambil dari API"
              : ""}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
