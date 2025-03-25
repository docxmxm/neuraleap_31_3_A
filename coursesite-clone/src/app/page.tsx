import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CourseCard from '@/components/courses/course-card';
import TestimonialCard from '@/components/testimonials/testimonial-card';
import BenefitCard from '@/components/benefits/benefit-card';
import PricingSection from '@/components/pricing/pricing-section';
import FAQSection from '@/components/faq/faq-section';
import { Briefcase, Award, MessageCircle, Clock, Users, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20 gradient-bg relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/10 text-xs mb-6">
                Trusted by 20,000+ Happy Learners
              </div>

              <h1 className="text-3xl md:text-5xl font-heading leading-tight mb-6">
                Web Dev & Design made <br />Simple, Better.
              </h1>

              <p className="text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0">
                Practical project-based courses that are easy to understand, straight to the point, and distractions while ensuring comprehensive learning.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/courses">
                  <Button className="rounded-full bg-white text-foreground hover:bg-gray-100 w-full sm:w-auto">
                    View All Courses
                  </Button>
                </Link>

                <Link href="#pricing">
                  <Button className="primary-gradient-btn rounded-full w-full sm:w-auto">
                    Start Learning Now
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <Image
                  src="https://framerusercontent.com/images/bLPeVxVKLpklv9oFjVbLuxp9E1s.png"
                  alt="Course illustration"
                  width={500}
                  height={400}
                  className="z-10 relative"
                />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-light/50 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-black/10">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Adopted by renowned enterprises such as
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              <Image
                src="https://ext.same-assets.com/1288700763/2324236672.png"
                alt="Company logo"
                width={100}
                height={40}
                className="opacity-70 hover:opacity-100 transition-opacity"
              />
              <Image
                src="https://ext.same-assets.com/1288700763/3499391391.png"
                alt="Company logo"
                width={100}
                height={40}
                className="opacity-70 hover:opacity-100 transition-opacity"
              />
              <Image
                src="https://ext.same-assets.com/1288700763/1347038984.png"
                alt="Company logo"
                width={100}
                height={40}
                className="opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Boost Your Skills Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="https://ext.same-assets.com/1682538620/1248550479.svg"
                alt="Decoration"
                width={24}
                height={24}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-4">We Offer</h2>
            <h3 className="text-xl md:text-2xl font-medium mb-6">Boost Your Skills</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From critical skills to technical topics, we support your professional development with courses that help you grow and succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-12">
            <div className="p-8 bg-white rounded-xl shadow-sm">
              <p className="text-4xl font-bold mb-2">80+</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">HOURS OF CONTENT</p>
            </div>

            <div className="p-8 bg-white rounded-xl shadow-sm">
              <p className="text-4xl font-bold mb-2">0+</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">COURSES</p>
            </div>

            <div className="p-8 bg-white rounded-xl shadow-sm">
              <p className="text-4xl font-bold mb-2">0k+</p>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">STUDENTS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="https://ext.same-assets.com/1682538620/1248550479.svg"
                alt="Decoration"
                width={24}
                height={24}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-4">Our Courses</h2>
            <h3 className="text-xl md:text-2xl font-medium mb-6">Featured Courses</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From critical skills to technical topics, we support your professional development with courses that help you grow and succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CourseCard
              id="1"
              title="JavaScript Full Mastery 2024 Edition Updated"
              slug="java-script-full-mastery-2024-updated"
              price={99}
              imageUrl="https://ext.same-assets.com/1288700763/4002956128.jpeg"
              rating={5}
              level="Intermediate"
              description="Master JavaScript with our updated course. Learn core concepts, ES6+, and advanced techniques to create dynamic, responsive web applications."
              isFeatured={true}
            />

            <CourseCard
              id="2"
              title="Framer Full Mastery & More 2024 Updated"
              slug="framer-full-mastery-2024-updated"
              price={99}
              imageUrl="https://ext.same-assets.com/1288700763/3117324725.jpeg"
              rating={5}
              level="Beginner"
              description="Master Framer in 2024 with this updated course. Learn to design, prototype, and build interactive websites with ease, plus explore advanced features and tools."
              isFeatured={true}
            />

            <CourseCard
              id="3"
              title="Figma Full Mastery 2024 Edition updated"
              slug="figma-full-mastery-2024-edition-updated"
              price={79}
              imageUrl="https://ext.same-assets.com/1288700763/1498993016.jpeg"
              rating={5}
              level="Beginner"
              description="Master Figma in 2024 with this updated course. Learn to design, prototype, and collaborate on stunning, user-friendly interfaces with ease."
              isFeatured={true}
            />
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/courses">
              <Button variant="outline" className="rounded-full">
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="https://ext.same-assets.com/1682538620/1248550479.svg"
                alt="Decoration"
                width={24}
                height={24}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-4">Testimonials</h2>
            <h3 className="text-xl md:text-2xl font-medium mb-6">Our Students feedback</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the incredible advantages of enrolling in our courses and enhancing your skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <TestimonialCard
              id="1"
              quote="The courses are top-notch, providing in-depth knowledge that's easy to apply. Each lesson is structured to ensure you fully grasp the material."
              authorName="Brendan Wilson"
              authorRole="Aspiring Web Designer"
              authorImage="https://ext.same-assets.com/1288700763/2170316133.jpeg"
              rating={5}
            />

            <TestimonialCard
              id="2"
              quote="The courses are excellent, delivering practical insights with ease. Each module is designed to help you fully understand and apply the knowledge."
              authorName="Rock Lee"
              authorRole="Web Designer"
              authorImage="https://ext.same-assets.com/1288700763/2951119278.png"
              rating={5}
            />

            <TestimonialCard
              id="3"
              quote="These courses are exceptional, offering detailed content thats easy to implement. Every lesson is carefully crafted to deepen your understanding."
              authorName="Sakura"
              authorRole="Web Developer"
              authorImage="https://ext.same-assets.com/1288700763/645290517.jpeg"
              rating={5}
            />
          </div>

          <div className="flex justify-center">
            <Link href="#pricing">
              <Button className="primary-gradient-btn rounded-full">
                Start Learning Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary/30" id="benefits">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="https://ext.same-assets.com/1682538620/1248550479.svg"
                alt="Decoration"
                width={24}
                height={24}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-4">Benefits</h2>
            <h3 className="text-xl md:text-2xl font-medium mb-6">Key Benefits of Courses</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the incredible advantages of enrolling in our courses and enhancing your skills for the ultimate career success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitCard
              title="Built by Professionals"
              description="Get the best Experience knowing that our Courses are built by Professionals."
              icon={<Briefcase className="text-primary h-10 w-10 p-2 bg-primary/10 rounded-lg" />}
            />

            <BenefitCard
              title="Completion Certificate"
              description="Receive a Completion Award from our Team to enhance your motivation"
              icon={<Award className="text-primary h-10 w-10 p-2 bg-primary/10 rounded-lg" />}
            />

            <BenefitCard
              title="Instant Chat Help"
              description="Have questions? Reach out for a quick chat here for you 24/7"
              icon={<MessageCircle className="text-primary h-10 w-10 p-2 bg-primary/10 rounded-lg" />}
            />

            <BenefitCard
              title="Lifetime Membership"
              description="With Just One Payment, you'll get Permanent Access to the Course."
              icon={<Clock className="text-primary h-10 w-10 p-2 bg-primary/10 rounded-lg" />}
            />

            <BenefitCard
              title="Access to Community"
              description="Join Our Private Community to Connect with Like-Minded Individuals and Grow Together."
              icon={<Users className="text-primary h-10 w-10 p-2 bg-primary/10 rounded-lg" />}
            />

            <BenefitCard
              title="Download for Offline Use"
              description="Our courses can be downloaded, so you can watch them anytime, anywhere."
              icon={<Download className="text-primary h-10 w-10 p-2 bg-primary/10 rounded-lg" />}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection
        title="Join Our Premium Courses"
        subtitle="Trusted by 70k+ students"
        plans={[
          {
            title: "Starter plan",
            price: 50.90,
            period: "mo",
            description: "Billed annually",
            features: [
              { text: "Limited Access to the platform" },
              { text: "10 Free Courses" },
              { text: "Limited Benefits" },
              { text: "Agent" },
              { text: "Live Chat Support" },
            ],
            buttonText: "Get Started",
            buttonLink: "https://framebase.lemonsqueezy.com/buy/80ebc834-9132-41aa-9cd5-e8170c4a7e95"
          },
          {
            title: "Pro plan",
            price: 70.90,
            period: "mo",
            description: "Billed annually",
            features: [
              { text: "Full Access to the platform" },
              { text: "20 Free Courses" },
              { text: "Unlimited Benefits" },
              { text: "Agent" },
              { text: "Live Chat Support" },
            ],
            buttonText: "Get Started",
            buttonLink: "https://framebase.lemonsqueezy.com/buy/80ebc834-9132-41aa-9cd5-e8170c4a7e95"
          },
          {
            title: "Business plan",
            price: 99.90,
            period: "mo",
            description: "Billed annually",
            features: [
              { text: "Full Access to the platform" },
              { text: "30 Free Courses" },
              { text: "Unlimited Benefits" },
              { text: "Agent" },
              { text: "Live Chat Support" },
            ],
            isPopular: true,
            buttonText: "Get Started",
            buttonLink: "https://framebase.lemonsqueezy.com/buy/80ebc834-9132-41aa-9cd5-e8170c4a7e95"
          }
        ]}
      />

      {/* About Me Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <div className="flex items-center mb-4">
                <Image
                  src="https://ext.same-assets.com/1682538620/1248550479.svg"
                  alt="Decoration"
                  width={24}
                  height={24}
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading mb-4">About Me</h2>
              <h3 className="text-xl md:text-2xl font-medium mb-6">But Why CourseSite ?</h3>
              <p className="text-muted-foreground mb-8">
                Explore the incredible advantages of enrolling in our courses and enhancing your skills for the ultimate career success.
              </p>

              <div className="space-y-6">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <h4 className="font-medium mb-2">Certificate of Completion</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive a recognized credential that significantly boosts your resume.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <h4 className="font-medium mb-2">Networking Opportunities</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with peers and valuable industry professionals for growth.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:w-1/2">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-4">
                  I started my journey:
                </p>
                <p className="font-medium mb-8">
                  In web design and development in 2010 at the age of 24. I transitioned into a full-time instructor and mentor in 2018
                </p>

                <p className="text-sm text-muted-foreground mb-4">
                  Through hands-on:
                </p>
                <p className="font-medium mb-8">
                  project-based courses, I simplify challenging topics and make them accessible to everyone.
                </p>

                <div className="flex space-x-4 mb-8">
                  <Link
                    href="https://www.linkedin.com/"
                    target="_blank"
                    className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
                  >
                    <Image
                      src="https://ext.same-assets.com/1682538620/1248550479.svg"
                      alt="LinkedIn"
                      width={16}
                      height={16}
                    />
                  </Link>
                  <Link
                    href="https://twitter.com/"
                    target="_blank"
                    className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
                  >
                    <Image
                      src="https://ext.same-assets.com/1682538620/1248550479.svg"
                      alt="Twitter"
                      width={16}
                      height={16}
                    />
                  </Link>
                  <Link
                    href="https://github.com/"
                    target="_blank"
                    className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"
                  >
                    <Image
                      src="https://ext.same-assets.com/1682538620/1248550479.svg"
                      alt="GitHub"
                      width={16}
                      height={16}
                    />
                  </Link>
                </div>

                <Image
                  src="https://framerusercontent.com/images/cSs17f2jQXJs0LLlHAxklY9Ik.png"
                  alt="Instructor"
                  width={300}
                  height={300}
                  className="rounded-lg mx-auto"
                />
              </div>

              <div className="mt-6 space-y-6">
                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <h4 className="font-medium mb-2">Comprehensive Curriculum</h4>
                  <p className="text-sm text-muted-foreground">
                    Master essential topics and practical skills effectively and thoroughly.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-sm">
                  <h4 className="font-medium mb-2">Expert Guidance</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn from experienced instructors for personalized and effective support.
                  </p>
                </div>
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

      {/* Course Topics Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="https://ext.same-assets.com/1682538620/1248550479.svg"
                alt="Decoration"
                width={24}
                height={24}
              />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading mb-4">Featured Topics</h2>
            <h3 className="text-xl md:text-2xl font-medium mb-6">Courses Topics</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the key topics covered in our courses, designed to equip you with the skills needed for real-world success.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              Web Development
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              Java Script
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              Framer
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              Web Design
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              Webflow
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              CSS
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              UI/UX Design
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              Angular
            </div>
            <div className="px-6 py-2 bg-white rounded-full shadow-sm text-sm">
              React
            </div>
          </div>
        </div>
      </section>

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

              <Link href="#pricing">
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
