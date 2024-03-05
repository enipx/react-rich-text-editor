import { SvgProps } from '@/types';

export const Check = ({ size = 16, ...props }: SvgProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 16 16"
      {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.333 4 6 11.333 2.667 8"
      />
    </svg>
  );
};
