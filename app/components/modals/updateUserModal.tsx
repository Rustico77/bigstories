"use client";

import { useState } from "react";
import { set, useForm } from "react-hook-form";

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
import { create } from "domain";
import { createUser, updateUser } from "@/app/actions/user";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { UserModel } from "@/app/models/user";

type FormData = {
  role: UserRole;
};

interface UpdateUserModalProps {
  id: string;
  user: UserModel;
  actions: () => Promise<void>;
}

export default function CreateUserModal({actions, user, id} : UpdateUserModalProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    
    user.role = data.role;

    const res = await updateUser(id, user);

    if (res.isSuccess) {
      toast.success(res.message);
      actions();
      setOpen(false);
      reset();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 rounded-lg bg-primary text-white font-bold cursor-pointer"
      >
        Créer un nouvel utilisateur
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mise à jour</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ Email */}
            <div>
              <Input
                type="email"
                hidden
                placeholder="Email"
                value={user.email}
              />
            </div>

            {/* Champ Rôle */}
            <div>
              <Select
                required
                onValueChange={(value) =>
                  setValue("role", value as "ADMIN" | "USER", {
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
                <p className="text-sm text-red-500">Rôle requis</p>
              )}
            </div>

            {/* Boutons */}
            <DialogFooter>
              <Button className="cursor-pointer" type="submit">
                Enregistrer
              </Button>
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
