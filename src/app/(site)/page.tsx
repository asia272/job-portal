import { getJobs, getFilterCounts } from "@/lib/jobs";
import { JobCategory } from "@/generated/prisma/client";
import JobCard from "@/components/job-card";
import FilterSidebar from "@/components/filter-sidebar";
import HeroSearch from "@/components/hero-search";
import JobPagination from "@/components/job-pagination";

type SP = { q?: string; location?: string | string[]; category?: string | string[]; page?: string };
const toArray = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const categories = toArray(sp.category).filter((c): c is JobCategory => c in JobCategory);
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ jobs, totalPages }, counts] = await Promise.all([
    getJobs({ q: sp.q, locations: toArray(sp.location), categories, page }),
    getFilterCounts(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4">
      <HeroSearch />
      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <FilterSidebar counts={counts} />
        <section>
          <h2 className="text-2xl font-semibold">Latest jobs</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
          <JobPagination page={page} totalPages={totalPages} />
        </section>
      </div>
    </main>
  );
}