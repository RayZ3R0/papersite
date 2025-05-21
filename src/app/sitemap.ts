import { MetadataRoute } from "next";

/**
 * Returns the list of hardcoded subject IDs.
 */
function getHardcodedSubjects() {
  return [
    "physics",
    "chemistry",
    "biology",
    "mathematics",
    "accounting",
    "economics",
    "business",
    "psychology"
  ];
}

/**
 * Get important pages that should always be in the sitemap
 */
function getStaticPages(baseUrl: string, lastModified: string): MetadataRoute.Sitemap {
  return [
    { url: `${baseUrl}`, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/papers`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/notes`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/forum`, lastModified, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/books`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/exams`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/latest`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/search`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/profile`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/auth/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/auth/register`, lastModified, changeFrequency: "monthly", priority: 0.5 }
  ];
}

function generateAnalyticsData(entries: MetadataRoute.Sitemap) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Sitemap generated with ${entries.length} URLs`);
  }
  return {
    generated: new Date().toISOString(),
    entryCount: entries.length
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://papernexus.xyz";
  const defaultLastModified = new Date().toISOString();

  const staticRoutes = getStaticPages(baseUrl, defaultLastModified);

  // Hardcoded subject routes
  const subjectRoutes = getHardcodedSubjects().map((id) => ({
    url: `${baseUrl}/papers/${id}`,
    lastModified: defaultLastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const allRoutes = [
    ...staticRoutes,
    ...subjectRoutes,
  ];

  generateAnalyticsData(allRoutes);

  return allRoutes;
}