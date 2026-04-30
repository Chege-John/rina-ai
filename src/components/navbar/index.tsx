import Image from "next/image";
import * as React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LANDING_PAGE_MENU } from "@/constants/landing-page";

function NavBar() {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="Rina AI Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="hidden font-bold sm:inline-block">Rina AI</span>
        </Link>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {LANDING_PAGE_MENU.map((menuItem) => (
            <Link
              key={menuItem.label}
              href={menuItem.path}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {menuItem.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button
              variant="default"
              className="hidden md:flex bg-ir-orange px-4 py-2 rounded-md text-white hover:bg-ir-orange/90"
            >
              Free Trial
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src="/images/logo.png"
                    alt="Rina AI Logo"
                    width={32}
                    height={32}
                  />
                  Rina AI
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8 px-4">
                {LANDING_PAGE_MENU.map((menuItem) => (
                  <Link
                    key={menuItem.label}
                    href={menuItem.path}
                    className="block text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    {menuItem.label}
                  </Link>
                ))}
                <Link href="/dashboard" className="mt-4">
                  <Button className="w-full bg-ir-orange text-white hover:bg-ir-orange/90">
                    Free Trial
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
