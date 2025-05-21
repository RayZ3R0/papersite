import { MetadataRoute } from "next";

// Types for better structure
interface Subject {
  id: string;
  name: string;
  units?: Unit[];
}

interface Unit {
  id: string;
  name: string;
  order: number;
  description: string;
}

/**
 * Fetch all subjects with their units from the API
 */
async function fetchSubjects(): Promise<Subject[]> {
  try {
    const apiRoot = process.env.PAPERVOID_API_URL;
    const response = await fetch(`${apiRoot}/api/subjects`, {
      // Adding cache control to optimize API calls during builds
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return []; // Return empty array as fallback
  }
}

/**
 * Get important pages that should always be in the sitemap
 * These are based on your actual directory structure
 */
function getStaticPages(baseUrl: string, lastModified: string): MetadataRoute.Sitemap {
  return [
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
    {
      url: `${baseUrl}/latest`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified, 
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Authentication pages (public facing ones only)
    {
      url: `${baseUrl}/auth/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    }
  ];
}

/**
 * Generate analytics data for the sitemap
 */
function generateAnalyticsData(entries: MetadataRoute.Sitemap) {
  // Instead of writing to filesystem, log to console during development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Sitemap generated with ${entries.length} URLs`);
  }
  
  return {
    generated: new Date().toISOString(),
    entryCount: entries.length
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Make sure baseUrl doesn't end with a slash
  const baseUrl = ("https://papernexus.xyz/").replace(/\/$/, "");

  // Default lastModified date for static pages
  const defaultLastModified = new Date().toISOString();
  
  // Get static pages
  const staticRoutes = getStaticPages(baseUrl, defaultLastModified);
  
  // Get all subjects with their units from API
  const subjects = await fetchSubjects();
  
  // Add main subject pages (these definitely exist based on your folder structure)
  const subjectRoutes = subjects.map((subject) => ({
    url: `${baseUrl}/papers/${subject.id}`,
    lastModified: defaultLastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  
  // Combine all routes
  const allRoutes = [
    ...staticRoutes,
    ...subjectRoutes,
  ];
  
  // Generate analytics data
  generateAnalyticsData(allRoutes);
  
  return allRoutes;
}