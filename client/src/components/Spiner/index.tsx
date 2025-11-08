import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

interface SpinnerWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export function SpinnerWrapper({ isLoading, children }: SpinnerWrapperProps) {

  return (
    <div className="relative h-full w-full overflow-hidden">
      {isLoading && (
        <div
          className="absolute top-[0px] left-[0px] inset-0 bg-white bg-opacity-20 flex justify-center items-center z-50 h-full w-full"
          role="dialog"
          aria-live="assertive"
        >
          <Spinner className="text-[#0563B2]" />
        </div>
      )}
      <div className="h-full w-full overflow-auto">
        <div>{children}</div>
      </div>
    </div>
  );
}
