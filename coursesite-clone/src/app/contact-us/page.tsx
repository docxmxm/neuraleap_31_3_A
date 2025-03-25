import Image from "next/image";
import Link from "next/link";
import FAQSection from "@/components/faq/faq-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div>
      {/* Contact Header */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="md:w-1/2">
              <div className="flex items-center mb-4">
                <Link href="/" className="mr-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </Link>
                <span className="text-sm">Contact Us</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-heading leading-tight mb-6">
                Get in touch with us today!
              </h1>

              <p className="text-muted-foreground mb-10">
                Whatever you need, whenever you need it, our team is here to help dedicated to supporting you every step of the way.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                <div className="p-6 rounded-xl bg-secondary/30">
                  <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2H2v16h2v4l5.5-4H22V2z" />
                      <circle cx="12" cy="10" r="2" />
                      <path d="M8 10a4 4 0 1 1 8 0" />
                    </svg>
                  </div>

                  <h3 className="text-lg font-medium mb-2">Message Us</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use our online chat system to message us and get support.
                  </p>
                  <Link
                    href="mailto:coursesite@support.com"
                    className="text-primary hover:underline font-medium"
                  >
                    coursesite@support.com
                  </Link>
                </div>

                <div className="p-6 rounded-xl bg-secondary/30">
                  <div className="w-12 h-12 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>

                  <h3 className="text-lg font-medium mb-2">Call us</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Let's chat - nothing better than talking to another human being.
                  </p>
                  <Link
                    href="tel:+1234567890"
                    className="text-primary hover:underline font-medium"
                  >
                    +1234567890
                  </Link>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 w-full">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <form className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Your Name"
                        className="custom-input"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="Your Email"
                        className="custom-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Textarea
                      placeholder="How Can We Help?"
                      className="custom-textarea"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="newsletter" className="text-sm text-muted-foreground">
                      Subscribe to Newsletter
                    </label>
                  </div>

                  <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-lg">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection
        faqs={[
          {
            question: "What is Course Site?",
            answer: "Course Site is an online learning platform that offers high-quality courses for web developers, designers, and digital professionals. Our courses are created by industry experts and designed to provide practical skills and knowledge."
          },
          {
            question: "Do you have refund policy?",
            answer: "Our Purchases happen through Whop. Whop has its own refund policy, which you can find on their website. We recommend reviewing their policy before making a purchase."
          },
          {
            question: "Is the community supportive?",
            answer: "Yes, our community is very supportive! We have an active forum where students can ask questions, share projects, and connect with other learners. Our instructors and teaching assistants also regularly participate to provide guidance."
          },
          {
            question: "Are there live classes or just recorded content?",
            answer: "We primarily offer recorded content that you can access anytime, anywhere. However, we also host regular live Q&A sessions and workshops for our premium members. These live sessions allow you to interact directly with instructors."
          }
        ]}
      />

      {/* Community Section */}
      <section className="py-16 gradient-bg">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
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
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <span className="text-sm font-medium text-primary">Community</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-heading mb-4">
                Join our community where creativity thrives.
              </h2>

              <p className="text-muted-foreground mb-8">
                Unlock the amazing benefits of joining our community, growing your skills, and building connections.
              </p>

              <Link href="/#pricing">
                <Button className="bg-black text-white hover:bg-gray-800 rounded-full">
                  Start Learning Now
                </Button>
              </Link>
            </div>

            <div className="md:w-1/2 relative">
              <Image
                src="https://ext.same-assets.com/1288700763/2607961425.png"
                alt="Community map"
                width={500}
                height={400}
                className="mx-auto"
              />

              <div className="absolute top-1/4 right-1/4 bg-white p-4 rounded-lg shadow-lg max-w-[200px]">
                <p className="text-sm">This one is slightly better, it has more contrast</p>
              </div>

              <div className="absolute bottom-1/3 right-1/2 bg-white p-4 rounded-lg shadow-lg max-w-[200px]">
                <p className="text-sm">Do you think this design is better?</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
