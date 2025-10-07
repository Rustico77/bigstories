"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

type ConfirmDeleteModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  email: string; 
};

export default function ConfirmDeleteUserModal({ open, setOpen, onConfirm, email }: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md text-center space-y-4">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-red-100 rounded-full">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-2">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer <span className="text-red-700 font-semibold">{email}</span> ?
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Cette action est irréversible.
          </p>
        </div>

        <DialogFooter className="flex justify-center space-x-4">
          <Button className="cursor-pointer" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button className="cursor-pointer" variant="destructive" onClick={() => { onConfirm(); }}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
