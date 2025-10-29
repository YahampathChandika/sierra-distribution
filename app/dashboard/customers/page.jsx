import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCustomers, getCustomerCities } from "@/lib/queries/customers";
import { CustomersContent } from "@/components/customers/customers-content";
import { CustomersSkeleton } from "@/components/customers/customers-skeleton";

export default async function CustomersPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    city:
      searchParams?.city && searchParams.city !== "all"
        ? searchParams.city
        : undefined,
    customerType:
      searchParams?.customer_type && searchParams.customer_type !== "all"
        ? searchParams.customer_type
        : undefined,
    isActive:
      searchParams?.status === "active"
        ? true
        : searchParams?.status === "inactive"
        ? false
        : undefined,
  };

  const [customers, cities] = await Promise.all([
    getCustomers(supabase, filters),
    getCustomerCities(supabase),
  ]);

  return (
    <Suspense fallback={<CustomersSkeleton />}>
      <CustomersContent customers={customers} cities={cities} />
    </Suspense>
  );
}
