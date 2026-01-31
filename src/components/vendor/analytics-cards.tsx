import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AnalyticsCards = ({ data }: { data: any }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold">₹{data.totalRevenue}</div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Platform Fees</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold text-red-600">-₹{data.platformCommission}</div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Net Payout</CardTitle></CardHeader>
        <CardContent><div className="text-2xl font-bold text-green-600">₹{data.netEarnings}</div></CardContent>
      </Card>
    </div>
  );
};