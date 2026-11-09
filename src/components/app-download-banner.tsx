import Image from "next/image";

export default function AppDownloadBanner() {
    return (
        <section
            aria-label="Download the mobile app"
            className="relative overflow-hidden rounded-[15px] bg-[linear-gradient(90deg,#F5F2FF_0%,#FBF7FF_100%)] lg:h-[354px]"
        >
            <div className="relative z-10 flex h-full flex-col justify-center px-6 py-12 sm:px-[65px] lg:py-0 lg:pl-[127px]">
                <h2 className="max-w-[420px] text-[28px] leading-[1.25] font-medium text-[#1E1E1E] sm:text-[36px]">
                    download mobile app for better experience
                </h2>

                <div className="mt-[30px] flex flex-wrap gap-4">
                    {/* Replace "#" with your real store links */}
                    <a href="#" aria-label="Get it on Google Play">
                        <Image
                            src="/assets/play_store.svg"
                            alt="Get it on Google Play"
                            width={176}
                            height={52}
                            className="h-[52px] w-auto"
                        />
                    </a>
                    <a href="#" aria-label="Download on the App Store">
                        <Image
                            src="/assets/app_store.svg"
                            alt="Download on the App Store"
                            width={176}
                            height={52}
                            className="h-[52px] w-auto"
                        />
                    </a>
                </div>
            </div>

            <Image
                src="/assets/app_main_img.png"
                alt=""
                width={376}
                height={337}
                className="pointer-events-none absolute right-[3%] bottom-0 hidden h-[337px] w-[376px] lg:block xl:right-[115px]"
            />
        </section>
    );
}