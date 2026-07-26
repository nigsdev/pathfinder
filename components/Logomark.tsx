type LogomarkProps = {
  className?: string;
};

export function Logomark({ className }: LogomarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-labelledby="logomark-title"
    >
      <title id="logomark-title">PathFinder</title>
      <mask id="logomark-mask">
        <rect width="64" height="64" fill="#fff" />
        <circle cx="26" cy="20" r="6" fill="#000" />
      </mask>
      <path
        d="M26 4C16.6 4 9 11.6 9 21c0 9 17 25 17 25s17-16 17-25C43 11.6 35.4 4 26 4Z"
        fill="#3B5BDB"
        mask="url(#logomark-mask)"
      />
      <path
        d="M26 46c8 6 18 6.5 26 2.5"
        stroke="#3B5BDB"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 9"
      />
      <circle cx="53" cy="48" r="4.5" fill="#F59E0B" />
    </svg>
  );
}
