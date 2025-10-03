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
import { createUser } from "@/app/actions/user";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

type FormData = {
  email: string;
  role: UserRole;
};

export default function CreateUserModal({actions} : {actions: () => Promise<void>}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log("Nouvel utilisateur :", data);

    const res = await createUser(data.email, data.role);

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
            <DialogTitle>Créer un utilisateur</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Champ Email */}
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register("email", { required: "Email requis" })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
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
