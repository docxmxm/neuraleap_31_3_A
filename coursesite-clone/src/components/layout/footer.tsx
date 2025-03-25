import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <Image
            src="https://ext.same-assets.com/1288700763/2414744611.png"
            alt="CourseSite Logo"
            width={180}
            height={50}
            className="mb-6"
          />
          <h2 className="text-2xl md:text-3xl font-heading mb-4">
            Boost your Learning & Knowledge with CourseSite Now
          </h2>
          <Link href="/#pricing">
            <Button className="primary-gradient-btn rounded-full px-8 py-6 font-medium text-base">
              Start Learning Now
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Your Path to Becoming a Web Wizard
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 mb-6 md:mb-0">
            <Link href="/#benefits" className="footer-link">
              Benefits
            </Link>
            <Link href="/courses" className="footer-link">
              Courses
            </Link>
            <Link href="/contact-us" className="footer-link">
              Contact
            </Link>
            <Link href="/reviews" className="footer-link">
              Reviews
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <div className="flex mb-4">
              <Link
                href="https://x.com/framebase_"
                target="_blank"
                className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full border border-border hover:border-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3.01006C23 3.01006 20.9821 4.20217 19.86 4.54006C19.2577 3.84757 18.4573 3.35675 17.567 3.13398C16.6767 2.91122 15.7395 2.96725 14.8821 3.29451C14.0247 3.62177 13.2884 4.20446 12.773 4.96377C12.2575 5.72309 11.9877 6.62239 12 7.54006V8.54006C10.2426 8.58562 8.50127 8.19587 6.93101 7.4055C5.36074 6.61513 4.01032 5.44869 3 4.01006C3 4.01006 -1 13.0101 8 17.0101C5.94053 18.408 3.48716 19.109 1 19.0101C10 24.0101 21 19.0101 21 7.51006C20.9991 7.23151 20.9723 6.95365 20.92 6.68006C21.9406 5.67355 23 3.01006 23 3.01006Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            <div className="flex">
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Notify Me"
                  className="newsletter-input"
                />
                <button className="newsletter-button">
                  Notify Me
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              CourseSite © 2024. Designed by{" "}
              <Link
                href="https://x.com/framebase_"
                target="_blank"
                className="text-primary hover:underline"
              >
                FrameBase
              </Link>
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          <Link
            href="https://framer.com/projects/new?duplicate=U7ddhboBRpl3AyZvXlej&via=nb12"
            target="_blank"
            className="flex items-center justify-center px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <span className="flex items-center">
              Try Demo
            </span>
          </Link>

          <Link
            href="https://framebase.lemonsqueezy.com/buy/80ebc834-9132-41aa-9cd5-e8170c4a7e95"
            target="_blank"
            className="text-sm hover:underline"
          >
            Get template
          </Link>
        </div>
      </div>
    </footer>
  );
}
