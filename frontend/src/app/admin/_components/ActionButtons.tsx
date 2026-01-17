import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  isSubmitting: boolean;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
};
export const ActionButtons = ({
  isSubmitting,
  cancelText = "Cancel",
  onSubmit,
  submitText = "Submit",
}: Props) => {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-4">
      <Button variant="secondary" onClick={() => router.back()}>
        {cancelText}
      </Button>
      <Button disabled={isSubmitting} onClick={onSubmit}>
        {submitText}
      </Button>
    </div>
  );
};
