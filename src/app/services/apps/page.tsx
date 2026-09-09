import type { Metadata } from "next";
import { services } from "@/data/services";
import { ServiceDetail } from "@/components/work/ServiceDetail";

const service = services.find((s) => s.slug === "apps")!;

export const metadata: Metadata = {
  title: service.shortName,
  description: service.description,
};

export default function AppsServicePage() {
  return <ServiceDetail service={service} />;
}
