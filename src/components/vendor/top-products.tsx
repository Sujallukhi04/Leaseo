import { getVendorAnalytics } from "@/actions/vendor/analytics";

export const TopProductsList = async () => {
  const analytics = await getVendorAnalytics();
  const productStats = analytics?.productStats ?? [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-bold mb-4">Most Rented Products</h3>
      <div className="space-y-4">
        {productStats.map((stat: any) => (
          <div key={stat.productId} className="flex justify-between items-center border-b pb-2">
            <span>Product ID: {String(stat.productId).slice(-6)}</span>
            <div className="text-right">
              <p className="font-medium">{stat._count?.id ?? 0} Rentals</p>
              <p className="text-xs text-gray-500">Earned: ₹{String(stat._sum?.totalPrice ?? 0)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};