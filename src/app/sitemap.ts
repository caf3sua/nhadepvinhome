import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${SITE_CONFIG.domain}`;
  const routes = [
    "",
    "/quy-can",
    "/ocean-park-2",
    "/ocean-park-3",
    "/mau-thiet-ke",
    "/lien-he",
    "/ve-tinh",
    "/am-thuc",
    "/3d",
    "/olympic",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/quy-can" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
