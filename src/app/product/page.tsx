import { redirect } from "next/navigation";

// The product page moved to /products/<slug> - keep old links working.
export default function ProductPage() {
  redirect("/products/vhsmo-camera");
}
