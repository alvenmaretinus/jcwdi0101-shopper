import { Spinner } from "@/components/ui/spinner";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
      <div className="bg-white/90 p-5 rounded-2xl shadow-xl">
        <Spinner className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    </div>
  );
};
