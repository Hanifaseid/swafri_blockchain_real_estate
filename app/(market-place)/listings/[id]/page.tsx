import { redirect } from "next/navigation";

// Back-compat: the canonical detail route is /properties/:id.
// Keep /listings/:id working by redirecting.
interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  redirect(`/properties/${id}`);
}
