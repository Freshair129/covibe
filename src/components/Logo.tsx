export function Logo({ size = 32, className = "" }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 128 128" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="128" height="128" rx="24" fill="#101418"/>
      <path d="M38 38h24a26 26 0 0 1 0 52H38V38Z" stroke="#78f4bf" strokeWidth="10" strokeLinejoin="round"/>
      <path d="M64 38h26a26 26 0 0 1 0 52H64" stroke="#f5ca78" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="38" cy="64" r="8" fill="#f3f7f4"/>
    </svg>
  );
}
