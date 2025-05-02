import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://papernexus.vercel.app/"}sitemap.xml`,
  };
}
