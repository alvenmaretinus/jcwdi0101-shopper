interface DotIndicatorsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}

export function DotIndicators({ total, current, onSelect }: DotIndicatorsProps) {
  return (
    <div className="flex justify-center gap-2 mt-6 sm:mt-8">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
            current === index
              ? "bg-white w-6 sm:w-8"
              : "bg-white/40 hover:bg-white/60 w-2 sm:w-2.5"
          }`}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}
