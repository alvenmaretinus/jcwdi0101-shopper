import { Button } from "@/components/ui/button";

type Props = {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  cancelText?: string;
  submitText?: string;
};
export const ActionButtons = ({
  isSubmitting,
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  submitText = "Submit",
}: Props) => {
  return (
    <div className="flex justify-end gap-4">
      <Button variant="secondary" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button disabled={isSubmitting} onClick={onSubmit}>
        {submitText}
      </Button>
    </div>
  );
};
