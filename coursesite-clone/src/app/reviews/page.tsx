import Image from "next/image";
import Link from "next/link";
import TestimonialCard from "@/components/testimonials/testimonial-card";
import FAQSection from "@/components/faq/faq-section";
import { Button } from "@/components/ui/button";

export default function ReviewsPage() {
  // Sample testimonials data
  const testimonials = [
    {
      id: "1",
      quote: "Engaging and insightful! I've learned so much more than expected.",
      authorName: "Brendan Wilson",
      authorRole: "Aspiring Web Designer",
      authorImage: "https://ext.same-assets.com/1288700763/2170316133.jpeg",
      rating: 5,
    },
    {
      id: "2",
      quote: "The courses go beyond basics, diving into details that make a real difference. I now feel fully equipped to tackle complex projects with confidence and skill.",
      authorName: "Wilson Jones",
      authorRole: "Aspiring Web Designer",
      authorImage: "https://ext.same-assets.com/1288700763/104308956.jpeg",
      rating: 5,
    },
    {
      id: "3",
      quote: "The courses are top-notch, providing in-depth knowledge that's easy to apply.",
      authorName: "Karaan Wilson",
      authorRole: "Aspiring Web Designer",
      authorImage: "https://ext.same-assets.com/1288700763/310194481.jpeg",
      rating: 5,
    },
    {
      id: "4",
      quote: "Absolutely worth it! The structure, depth, and hands-on approach make learning a breeze. These lessons have transformed the way I approach my work every day.",
      authorName: "Jane Hosl",
      authorRole: "Web Designer",
      authorImage: "",
      rating: 5,
    },
    {
      id: "5",
      quote: "The lessons are thorough and make complex topics easy to understand.",
      authorName: "Dhareen Rays",
      authorRole: "Web Designer",
      authorImage: "",
      rating: 5,
    },
    {
      id: "6",
      quote: "Outstanding! The courses cover every aspect needed to build expertise. I've gained valuable skills, and the real-world examples make everything easy to apply.",
      authorName: "Rock Lee",
      authorRole: "Web Designer",
      authorImage: "https://ext.same-assets.com/1288700763/2951119278.png",
      rating: 5,
    },
    {
      id: "7",
      quote: "Great courses! They've helped me grow my skills quickly and confidently.",
      authorName: "Sakura",
      authorRole: "Web Developer",
      authorImage: "https://ext.same-assets.com/1288700763/645290517.jpeg",
      rating: 5,
    },
    {
      id: "8",
      quote: "A game-changer! These courses provide in-depth explanations, practical examples, and an easy-to-follow format that's perfect for anyone looking to upskill.",
      authorName: "Robert Sean",
      authorRole: "Web Developer",
      authorImage: "",
      rating: 5,
    },
    {
      id: "9",
      quote: "Excellent content! I've gained skills I can use right away in my work.",
      authorName: "Brendan Wilson",
      authorRole: "Web Developer",
      authorImage: "https://ext.same-assets.com/1288700763/2170316133.jpeg",
      rating: 5,
    },
  ];

  return (
    <div>
      {/* Reviews Header */}
      <section className="py-12 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="mr-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <span className="text-sm">Reviews</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading mb-6">
            Stories from Our Amazing Students
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore the incredible advantages of enrolling in our courses, enhancing your skills, and unlocking new opportunities for growth
          </p>

          <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 text-sm mb-6">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary mr-2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            rated 4/5 by over 70k+ students
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                id={testimonial.id}
                quote={testimonial.quote}
                authorName={testimonial.authorName}
                authorRole={testimonial.authorRole}
                authorImage={testimonial.authorImage}
                rating={testimonial.rating}
              />
            ))}
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
