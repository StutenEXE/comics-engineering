import { twMerge } from "tailwind-merge";
import { RiLoader4Fill } from "react-icons/ri";


interface LoadingBadgeProps {
    size?: number
    isLoading?: boolean
    className?: string
}

export default function LoadingBadge({
    size = 16,
    isLoading,
    className,
}: LoadingBadgeProps) {
  return (
    <>
        {/* If isLoading is not set, just show the badge */}
        { (isLoading === null || isLoading === undefined || isLoading) && ( 
            <RiLoader4Fill 
                size={size}
                className={twMerge("animate-spin text-amber-400", className)}
            />
        )}
    </> 
  );
}
