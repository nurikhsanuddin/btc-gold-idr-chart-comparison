"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const routes = [
  { name: "Dashboard", href: "/" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl font-bold">Crypto vs Gold vs IDR</h1>
          </Link>
        </div>

        {/* Desktop navigation - simple reliable approach */}
        <div className="flex-1 flex justify-end items-center">
          <div className="hidden md:flex space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium px-4 py-2 rounded-md transition-colors",
                  pathname === route.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/80 hover:text-accent-foreground"
                )}
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Buka menu navigasi</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu Navigasi</SheetTitle>
              <SheetDescription>
                Akses berbagai bagian aplikasi
              </SheetDescription>
            </SheetHeader>
            <nav className="grid gap-2 py-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`text-sm font-medium p-2 hover:bg-accent rounded-md ${
                    pathname === route.href ? "bg-accent" : ""
                  }`}
                >
                  {route.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
