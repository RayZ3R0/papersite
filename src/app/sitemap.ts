import { MetadataRoute } from "next";

// Replace with your actual API function to get subjects
async function getSubjects() {
  // This is a placeholder. Replace with your actual API call or data source
  return [
    { id: "mathematics", name: "Mathematics" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "economics", name: "Economics" },
    { id: "accounting", name: "Accounting" },
    { id: "psychology", name: "Psychology" },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Make sure baseUrl doesn't end with a slash
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://edexcel.vercel.app"
  ).replace(/\/$/, "");

  // Get all subjects
  const subjects = await getSubjects();

  // Base routes
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/papers`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/notes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/books`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Add subject pages
  const subjectRoutes = subjects.map((subject) => ({
    url: `${baseUrl}/papers/${subject.id}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...routes, ...subjectRoutes];
}
