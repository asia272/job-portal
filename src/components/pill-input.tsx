import Image from "next/image";

type Props = {
    icon: string;
    label: string;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function PillInput({ icon, label, error, className = "", ...props }: Props) {
    return (
        <div>
            <label
                className={`flex h-[50px] items-center gap-3 rounded-full border bg-white px-5 transition-colors focus-within:border-[#007AFF] ${error ? "border-red-400" : "border-[#D6D6D6]"
                    }`}
            >
                <Image src={icon} alt="" width={18} height={18} className="size-[18px] shrink-0" />
                <span className="sr-only">{label}</span>
                <input
                    {...props}
                    placeholder={props.placeholder ?? label}
                    aria-invalid={Boolean(error)}
                    className={`w-full min-w-0 bg-transparent text-[16px] text-[#222222] outline-none placeholder:text-[#9D9D9D] ${className}`}
                />
            </label>
            {error && <p className="mt-1.5 px-5 text-[13px] text-red-600">{error}</p>}
        </div>
    );
}