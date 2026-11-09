import { Suspense } from "react";
import { getJobs, getFilterCounts } from "@/lib/jobs";
import { JobCategory } from "@/generated/prisma/client";
import JobCard from "@/components/job-card";
import FilterSidebar from "@/components/filter-sidebar";
import HeroSearch from "@/components/hero-search";
import JobPagination from "@/components/job-pagination";
import Loading from "@/app/loading";
import AppDownloadBanner from "@/components/app-download-banner";
import TrustedBy from "@/components/trusted";

type SP = {
  q?: string;
  location?: string | string[];
  category?: string | string[];
  page?: string;
};

const toArray = (v?: string | string[]) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

export default function Home({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <main className=" w-full pb-16">
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent searchParams={searchParams} />
      </Suspense>

      <div className="mt-20 lg:mt-[342px]">
        <AppDownloadBanner />
      </div>
    </main>
  );
}


// background: #000000;
// background: #5E5E5E;
// background: #007AFF;
// background: #797484;
// background: #006CE2;
// background: #222222;
// background: #9D9D9D;

function HomeSkeleton() {
  return (
    <>
      <Loading />
    </>
  );
}

async function HomeContent({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const categories = toArray(sp.category).filter(
    (c): c is JobCategory => c in JobCategory
  );
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ jobs, totalPages }, counts] = await Promise.all([
    getJobs({ q: sp.q, locations: toArray(sp.location), categories, page }),
    getFilterCounts(),
  ]);

  return (
    <>
      <HeroSearch />
      <TrustedBy />

      <div className="mt-16 grid items-start gap-8 lg:grid-cols-[274px_1fr] lg:gap-x-[18px]">
        <FilterSidebar counts={counts} />

        <section aria-label="Latest jobs">
          <h2 className="text-[30px] leading-[42px] font-medium text-[#1F1F1F]">Latest jobs</h2>
          <p className="mt-1 text-[16px] leading-[22px] text-[#797484]">
            Get your desired job from top companies
          </p>

          {jobs.length === 0 ? (
            <div className="mt-8 rounded-[8px] border border-[#E1E1E1] p-10 text-center text-[15px] text-[#686868]">
              No jobs match your search. Try changing or clearing the filters.
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <JobPagination page={page} totalPages={totalPages} />
        </section>
      </div>
    </>
  );
}