import { cn } from "@/lib/utils";

interface ExploreButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function ExploreButton({ onClick, className = "" }: ExploreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative z-10 flex items-center gap-2 overflow-hidden rounded-full border border-primary/30",
        "bg-primary px-4 py-2 text-primary-foreground shadow-xl",
        "cursor-pointer backdrop-blur-md transition-colors duration-300 hover:bg-primary-400",
        "lg:font-semibold isolation-auto group",
        className,
      )}
    >
      Explore
      <svg
        className="h-8 w-8 rotate-45 justify-end rounded-full border border-primary-foreground/30 p-2 text-primary-foreground transition-transform duration-300 ease-linear group-hover:rotate-90"
        viewBox="0 0 16 19"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
          className="fill-current"
        ></path>
      </svg>
    </button>
  );
}
