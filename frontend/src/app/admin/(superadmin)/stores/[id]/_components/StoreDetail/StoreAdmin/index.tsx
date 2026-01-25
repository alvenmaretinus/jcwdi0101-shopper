"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/types/User";
import { UserMinus, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { AddAdminDialog } from "./AddAdminDialog";
import { RemoveAdminDialog } from "./RemoveAdminDialog";
import { Store } from "@/types/Store";

type Props = {
  storeWithEmployees: Store & {
    employees: User[];
  };
};

export const StoreAdmin = ({ storeWithEmployees }: Props) => {
  const { employees, ...store } = storeWithEmployees;

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isRemoveAdminOpen, setIsRemoveAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);

  useEffect(() => {
    if (isAddAdminOpen) setIsRemoveAdminOpen(false);
    if (isRemoveAdminOpen) setIsAddAdminOpen(false);
  }, [isRemoveAdminOpen, isAddAdminOpen]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Store Admins</CardTitle>
              <CardDescription>Users who can manage this store</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsAddAdminOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No employee assigned to this store</p>
              <Button variant="link" onClick={() => setIsAddAdminOpen(true)}>
                Add the first admin
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAdmin(employee);
                          setIsRemoveAdminOpen(true);
                        }}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddAdminDialog
        store={store}
        isAdminOpen={isAddAdminOpen}
        setIsAdminOpen={setIsAddAdminOpen}
      />
      <RemoveAdminDialog
        store={store}
        isOpen={isRemoveAdminOpen}
        setIsOpen={setIsRemoveAdminOpen}
        selectedAdmin={selectedAdmin}
        setSelectedAdmin={setSelectedAdmin}
      />
    </>
  );
};
