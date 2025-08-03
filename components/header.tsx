"use client";

import Image from "next/image";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SignedIn, UserButton } from "@clerk/nextjs";

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <header className="flex h-14 lg:h-[60px] items-center lg:justify-end justify-between gap-4 border-b bg-muted/40 px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
