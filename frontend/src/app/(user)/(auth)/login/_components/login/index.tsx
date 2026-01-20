import { LoginForm } from "@/components/login-form";
import { NAVBAR_HEIGHT } from "@/constants/navbar";
import Image from "next/image";

export const Login = () => {
  return (
    <div className={`grid h-[calc(100vh-${NAVBAR_HEIGHT}px)] lg:grid-cols-2`}>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden lg:block">
        <Image
          width={500}
          height={500}
          src="/sayur.jpg"
          alt="Vegetables"
          className="absolute h-full w-full object-cover"
        />
      </div>
    </div>
  );
};
