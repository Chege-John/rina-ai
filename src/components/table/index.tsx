import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type DataTableProps = {
  headers: string[];
  children: React.ReactNode;
};

export const DataTable = ({ headers, children }: DataTableProps) => {
  return (
    <Table className="rounded-t-xl overflow-hidden">
      <TableHeader>
        <TableRow className="bg-orange-200">
          {headers.map((header, index) => (
            <TableHead
              key={index}
              className={cn(
                index === headers.length - 1 && "text-right",
                "text-black"
              )}
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
};
