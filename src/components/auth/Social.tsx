"use client";

import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const Social = ({ disabled }: { disabled: boolean }) => {
  const searchparams = useSearchParams();
  const callbackUrl = searchparams.get("callbackUrl");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onClick = () => {
    // setDisabled(true);
    setIsLoading(true);
    try {
      signIn("google", {
        callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
    } catch (e) {
      console.error("Error: ", e);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative mt-[-8px] w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex w-full justify-center text-sm ">
          <span className="px-2 text-muted-foreground bg-card">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 mt-1 w-full">
        <Button
          className="mt-3 w-full mb-0"
          onClick={() => onClick()}
          variant="outline"
          disabled={disabled}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
      </div>
    </>
  );
};

export default Social;
