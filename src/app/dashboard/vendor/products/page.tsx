import { getVendorProducts } from "@/actions/vendor/products";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function VendorProductsPage() {
  const products: any[] = await getVendorProducts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/dashboard/vendor/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Base Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4 text-gray-500">{product.sku}</td>
                <td className="p-4">₹{product.basePrice.toString()}</td>
                <td className="p-4">{product.quantity}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${product.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {product.isPublished ? "Live" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}