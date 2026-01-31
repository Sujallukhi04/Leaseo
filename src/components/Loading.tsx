"use client";

import { Spinner } from "@/components/ui/spinner";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Spinner size can be adjusted with className */}
      <Spinner className="w-8 h-8 sm:w-10 sm:h-10 " />
    </div>
  );
};

export default Loading;
