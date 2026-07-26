type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 336 64"
      fill="none"
      className={className}
      role="img"
      aria-labelledby="wordmark-title"
    >
      <title id="wordmark-title">PathFinder</title>
      <g transform="translate(0,2)">
        <path
          d="M26 4C16.6 4 9 11.6 9 21c0 9 17 25 17 25s17-16 17-25C43 11.6 35.4 4 26 4Z"
          fill="#3B5BDB"
        />
        <circle cx="26" cy="20" r="6" fill="#ffffff" />
        <path
          d="M26 46c8 6 18 6.5 26 2.5"
          stroke="#3B5BDB"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="0.1 9"
        />
        <circle cx="53" cy="48" r="4.5" fill="#F59E0B" />
      </g>
      <text
        x="82"
        y="42"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="42"
        fontWeight="700"
        letterSpacing="-1.2"
      >
        <tspan fill="#1B2130">Path</tspan>
        <tspan fill="#3B5BDB">Finder</tspan>
      </text>
    </svg>
  );
}
