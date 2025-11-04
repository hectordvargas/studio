import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 40"
        width="128"
        height="32"
        {...props}
    >
        <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
            <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--accent))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
        </defs>
        
        {/* <!-- Text: AxusHire --> */}
        <text x="5" y="27" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="url(#gradient)">
            Kogni
            <tspan fill="url(#gradient-accent)">SYNC</tspan>
        </text>
    </svg>
  );
}
