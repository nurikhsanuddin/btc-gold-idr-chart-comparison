import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">About This Project</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This project aims to provide a visual comparison between Bitcoin
            (BTC), Gold, and the Indonesian Rupiah (IDR) against the US Dollar.
            By normalizing all three assets to a starting value of 100%, we can
            easily see which asset has performed better over time.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Why Compare These Assets?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            These three assets represent different investment and store-of-value
            strategies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Bitcoin (BTC)</strong>: A digital asset often referred to
              as "digital gold" and considered by some as a hedge against
              inflation.
            </li>
            <li>
              <strong>Gold</strong>: Traditionally seen as a safe haven asset
              during economic uncertainty.
            </li>
            <li>
              <strong>Indonesian Rupiah (IDR)</strong>: Represents a fiat
              currency subject to monetary policies and inflation.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            All price data is sourced from Alpha Vantage API, which provides
            reliable financial data for various assets. The chart normalizes all
            values to 100 at the starting point to provide a fair comparison of
            performance over time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
