"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { KeyRound } from "lucide-react";

type PasswordModalProps = {
  password: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function ShowPasswordModal({ password, open, setOpen }: PasswordModalProps) {

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md text-center space-y-4">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-green-100 rounded-full">
              <KeyRound className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            Nouveau mot de passe généré
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-2">
          <p className="text-gray-700">
            le nouveau mot de passe est :
          </p>
          <p className="font-mono text-lg font-bold text-green-700">
            {password}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez le noter quelque part, car il ne sera plus affiché.
          </p>
        </div>

        <DialogFooter className="flex justify-center">
          <Button onClick={() => setOpen(false)}>✅ J’ai noté</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
