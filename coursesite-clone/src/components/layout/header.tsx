"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="https://ext.same-assets.com/1288700763/2414744611.png"
            alt="CourseSite Logo"
            width={150}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/courses"
            className={`nav-link ${pathname === "/courses" ? "active" : ""}`}
          >
            Courses
          </Link>
          <Link
            href="/reviews"
            className={`nav-link ${pathname === "/reviews" ? "active" : ""}`}
          >
            Reviews
          </Link>
          <Link
            href="/contact-us"
            className={`nav-link ${pathname === "/contact-us" ? "active" : ""}`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/#pricing">
            <Button variant="outline" className="rounded-full">
              Join Now
            </Button>
          </Link>

          <Link href="https://framer.com/projects/new?duplicate=U7ddhboBRpl3AyZvXlej&via=nb12" target="_blank">
            <Button className="bg-black text-white hover:bg-gray-800 rounded-full">
              <span className="flex items-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 12L8 8M12 12L16 16M12 12L16 8M12 12L8 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Template Demo
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
