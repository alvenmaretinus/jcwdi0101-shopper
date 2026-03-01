interface ReportEmptyStateProps {
  isLoading: boolean;
  hasData: boolean;
  message: string;
}

export function ReportEmptyState({ isLoading, hasData, message }: ReportEmptyStateProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading report...</div>;
  }

  if (!hasData) {
    return <div className="text-center py-8 text-muted-foreground">{message}</div>;
  }

  return null;
}
