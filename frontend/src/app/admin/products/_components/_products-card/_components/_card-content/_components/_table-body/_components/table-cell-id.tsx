import { TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TableCellId(props: any) {
    return (
        <TableCell className="text-muted-foreground font-mono text-sm">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="cursor-help hover:text-foreground transition-colors">
                        {props.product.id.substring(0, 8)}...
                    </TooltipTrigger>
                    <TooltipContent>
                        <code className="text-xs">{props.product.id}</code>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </TableCell>
    );
}
