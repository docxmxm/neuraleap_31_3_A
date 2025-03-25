import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import Image from "next/image";

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <section className="py-12 md:py-16 bg-purple-light/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column */}
          <div className="md:w-1/3">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <span className="text-sm font-medium text-primary">Faq Hub</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-4">
              Frequently Asked Questions!
            </h2>

            <div className="p-6 bg-white rounded-xl">
              <h3 className="text-lg font-medium mb-2">Still Have Questions?</h3>
              <Link href="/contact-us" className="text-sm hover:text-primary">
                Contact Us, We are happy to help you
              </Link>

              <div className="flex mt-4 -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                  <Image
                    src="https://ext.same-assets.com/1288700763/2170316133.jpeg"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                  <Image
                    src="https://ext.same-assets.com/1288700763/645290517.jpeg"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden relative">
                  <Image
                    src="https://ext.same-assets.com/1288700763/104308956.jpeg"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <Link href="/#pricing">
                <button className="w-full mt-4 bg-black text-white rounded-full py-2 text-sm">
                  Start Learning Now
                </button>
              </Link>
            </div>
          </div>

          {/* Right column with accordion */}
          <div className="md:w-2/3">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-xl overflow-hidden border-0 shadow-sm">
                  <AccordionTrigger className="px-6 py-4 text-left font-medium hover:no-underline hover:bg-secondary/30">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
