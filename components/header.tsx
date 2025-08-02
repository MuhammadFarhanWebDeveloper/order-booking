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
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden"
        onClick={onToggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
