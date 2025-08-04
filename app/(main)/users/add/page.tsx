"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createUser } from "@/lib/actions/user.action";
import { toast } from "sonner";
import { useTransition } from "react";
import { useSession } from "next-auth/react";

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SALES_AGENT = "SALES_AGENT",
}

const formSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(4, "Name must be at least 4 characters long"),
  role: z.enum(Role, "Invalid Role"),
});

export type UserFormValues = z.infer<typeof formSchema>;

export default function Page() {
  const [isCreating, startCreating] = useTransition();

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isManager = session?.user?.role === "MANAGER";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: Role.SALES_AGENT,
    },
  });

  const onSubmit = (data: UserFormValues) => {
    startCreating(async () => {
      try {
        const res = await createUser(data);
        if (!res.success) {
          toast.error(res.message || "Failed to create user");
          return;
        }
        toast.success(res.message || "User created successfully");
        form.reset(); // Optional: reset form after success
      } catch (err: any) {
        toast.error("Something went wrong.");
      }
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Create User</CardTitle>
          <CardDescription>
            Fill in the details to create a new user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <Label>Username</Label>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Password</Label>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label>Name</Label>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <Label>Role</Label>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {!isAdmin ? (
                            ""
                          ) : (
                            <>
                              <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                              <SelectItem value={Role.MANAGER}>
                                Manager
                              </SelectItem>
                            </>
                          )}
                          <SelectItem value={Role.SALES_AGENT}>
                            Sales Agent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <span className="animate-spin mr-2 border-2 border-t-transparent rounded-full w-4 h-4 inline-block" />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
