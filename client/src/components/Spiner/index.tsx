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
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          role="dialog"
          aria-live="assertive"
        >
          <Spinner className="text-white" />
        </div>
      )}
      <div className={isLoading ? "opacity-20" : ""}>{children}</div>
    </div>
  );
}
