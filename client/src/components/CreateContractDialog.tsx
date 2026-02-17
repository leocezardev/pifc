import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContractSchema, type InsertContract } from "@shared/schema";
import { useCreateContract } from "@/hooks/use-contracts";
import { Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Fix schema types for form (value needs coercion from string input)
const formSchema = insertContractSchema.extend({
  value: z.coerce.number().min(0, "Value must be positive"),
  contractDate: z.coerce.date(),
});

export function CreateContractDialog() {
  const [open, setOpen] = useState(false);
  const createContract = useCreateContract();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      supplierName: "",
      description: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Transform number back to string for decimal type if needed, or pass as is
    // The schema expects string or number for decimal fields typically depending on driver
    // Drizzle-zod usually handles this, but let's be safe
    createContract.mutate({
      ...data,
      value: String(data.value) as any, // Cast for API compatibility
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Contract Title</Label>
            <Input id="title" placeholder="e.g. IT Support 2024" {...form.register("title")} />
            {form.formState.errors.title && <span className="text-xs text-destructive">{form.formState.errors.title.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input id="supplierName" placeholder="Acme Corp" {...form.register("supplierName")} />
            {form.formState.errors.supplierName && <span className="text-xs text-destructive">{form.formState.errors.supplierName.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractDate">Date</Label>
              <Input id="contractDate" type="date" {...form.register("contractDate")} />
              {form.formState.errors.contractDate && <span className="text-xs text-destructive">{form.formState.errors.contractDate.message}</span>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Total Value (R$)</Label>
              <Input id="value" type="number" step="0.01" placeholder="0.00" {...form.register("value")} />
              {form.formState.errors.value && <span className="text-xs text-destructive">{form.formState.errors.value.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Scope details..." {...form.register("description")} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createContract.isPending}>
              {createContract.isPending ? "Creating..." : "Create Contract"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
