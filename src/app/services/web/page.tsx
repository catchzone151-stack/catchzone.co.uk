import type { Metadata } from "next";
import { services } from "@/data/services";
import { ServiceDetail } from "@/components/work/ServiceDetail";

const service = services.find((s) => s.slug === "web")!;

export const metadata: Metadata = {
  title: service.shortName,
  description: service.description,
};

export default function WebServicePage() {
  return <ServiceDetail service={service} />;
}
