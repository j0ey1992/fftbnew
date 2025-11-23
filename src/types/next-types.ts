// Temporary file to define Next.js 15.3.0 compatible types

export interface PageProps {
  params: Promise<any>;
  searchParams: Record<string, string | string[] | undefined>;
}
