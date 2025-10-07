"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, User } from "@prisma/client";
import { toast } from "sonner";
import { updateUser } from "@/app/actions/user"; // ← à adapter selon ton chemin réel
import { UserModel } from "@/app/models/user";

type FormData = {
  email: string;
  role: UserRole;
};

type UpdateUserModalProps = {
  user?: UserModel;
  actions: () => Promise<void>;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function UpdateUserModal({ user, actions, open, setOpen }: UpdateUserModalProps) {

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: user?.email,
      role: user?.role,
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("User avant:", user);
    const userRes = user ? { ...user } : {} as UserModel;
    userRes.role = data.role;
    const res = await updateUser(user!.id!, userRes);

    if (res.isSuccess) {
      toast.success("Utilisateur mis à jour avec succès !");
      console.log("User après:", userRes);
      actions();
      setOpen(false);
      reset();
    } else {
      toast.error(res.message || "Une erreur est survenue");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l’utilisateur</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ Email (non modifiable) */}
            <div>
              <Input
                type="email"
                value={user?.email}
                readOnly
                className="bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                L’email ne peut pas être modifié.
              </p>
            </div>

            {/* Champ Rôle */}
            <div>
              <Select
                defaultValue={user?.role}
                onValueChange={(value) =>
                  setValue("role", value as UserRole, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Super Admin</SelectItem>
                  <SelectItem value="USER">Simple Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Boutons */}
            <DialogFooter className="flex justify-end space-x-2">
              <Button
              className="cursor-pointer"
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
