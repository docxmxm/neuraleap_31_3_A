import Image from "next/image";
import Link from "next/link";
import CourseCard from "@/components/courses/course-card";
import BenefitCard from "@/components/benefits/benefit-card";
import FAQSection from "@/components/faq/faq-section";
import { Button } from "@/components/ui/button";
import { Award, MessageCircle, Clock, Users, Download, Briefcase } from "lucide-react";

export default function CoursesPage() {
  // Sample courses data
  const courses = [
    {
      id: "1",
      title: "JavaScript Full Mastery 2024 Edition Updated",
      slug: "java-script-full-mastery-2024-updated",
      price: 99,
      imageUrl: "https://ext.same-assets.com/1288700763/4002956128.jpeg",
      rating: 5,
      level: "Intermediate",
      description: "Master JavaScript with our updated course. Learn core concepts, ES6+, and advanced techniques to create dynamic, responsive web applications.",
      isFeatured: true,
    },
    {
      id: "2",
      title: "How To Become Web Developer In 2024",
      slug: "how-to-become-web-dev-in-2024",
      price: 59,
      imageUrl: "https://ext.same-assets.com/1288700763/848002141.jpeg",
      rating: 5,
      level: "Intermediate",
      description: "Become a web developer in 2024 with our step-by-step course. Master HTML, CSS, JavaScript, and modern frameworks to build professional websites.",
      isFeatured: false,
    },
    {
      id: "3",
      title: "Node JS & React JS Full Mastery 2024 New",
      slug: "node-js-react-js-full-mastery-2024-new",
      price: 79,
      imageUrl: "https://ext.same-assets.com/1288700763/1286702683.jpeg",
      rating: 5,
      level: "Advanced",
      description: "Master Node.js and React.js with this all-in-one course. Learn to build fast, scalable server-side apps and modern, dynamic front-end interfaces for 2024.",
      isFeatured: false,
    },
    {
      id: "4",
      title: "Framer Full Mastery & More 2024 Updated",
      slug: "framer-full-mastery-2024-updated",
      price: 99,
      imageUrl: "https://ext.same-assets.com/1288700763/3117324725.jpeg",
      rating: 5,
      level: "Beginner",
      description: "Master Framer in 2024 with this updated course. Learn to design, prototype, and build interactive websites with ease, plus explore advanced features and tools.",
      isFeatured: true,
    },
    {
      id: "5",
      title: "Webflow Full Mastery 2024 Updated",
      slug: "webflow-full-mastery-2024-updated",
      price: 149,
      imageUrl: "https://ext.same-assets.com/1288700763/329184364.png",
      rating: 5,
      level: "Intermediate",
      description: "Master Webflow in 2024 with this updated course. Learn to design, build, and launch responsive websites without code, using modern tools and techniques.",
      isFeatured: false,
    },
    {
      id: "6",
      title: "How To Become Web Designer In 2024",
      slug: "how-to-become-web-designer-in-2024",
      price: 56,
      imageUrl: "https://ext.same-assets.com/1288700763/2407078835.jpeg",
      rating: 5,
      level: "Advanced",
      description: "Master the art of web design with our comprehensive course. Learn HTML, CSS, and cutting-edge design principles to build stunning, responsive websites from scratch.",
      isFeatured: false,
    },
    {
      id: "7",
      title: "Figma Full Mastery 2024 Edition updated",
      slug: "figma-full-mastery-2024-edition-updated",
      price: 79,
      imageUrl: "https://ext.same-assets.com/1288700763/1498993016.jpeg",
      rating: 5,
      level: "Beginner",
      description: "Master Figma in 2024 with this updated course. Learn to design, prototype, and collaborate on stunning, user-friendly interfaces with ease.",
      isFeatured: true,
    },
    {
      id: "8",
      title: "Web Dev Mastery 2024 Updated Edition",
      slug: "web-dev-mastery-2024-updated-edition",
      price: 39,
      imageUrl: "https://ext.same-assets.com/1288700763/1098883110.jpeg",
      rating: 5,
      level: "Advanced",
      description: "Master web development in 2024 with this updated course. Learn HTML, CSS, JavaScript, and modern frameworks to build responsive, dynamic websites.",
      isFeatured: true,
    },
    {
      id: "9",
      title: "React Full Mastery 2024 updated Edition",
      slug: "react-full-mastery-2024-updated-edition",
      price: 99,
      imageUrl: "https://ext.same-assets.com/1288700763/4024458159.jpeg",
      rating: 5,
      level: "Intermediate",
      description: "Master React in 2024 with this updated course. Learn to build dynamic, high-performance user interfaces and manage state with ease.",
      isFeatured: false,
    },
  ];

  return (
    <div>
      {/* Courses Header */}
      <section className="py-12 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="mr-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <span className="text-sm">All courses</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading mb-6">
            All Online Courses
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Find what fascinates you as you explore these online courses.
          </p>
        </div>
      </section>

      {/* Courses List */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-medium">All Courses</h2>

            <div className="relative">
              <select className="appearance-none bg-white border border-border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option value="all">All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                slug={course.slug}
                price={course.price}
                imageUrl={course.imageUrl}
                rating={course.rating}
                level={course.level as "Beginner" | "Intermediate" | "Advanced"}
                description={course.description}
                isFeatured={course.isFeatured}
              />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Button variant="outline" className="rounded-lg">
              Load More
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary/30" id="benefits">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading mb-4">Key Benefits of Courses</h2>
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
            <h2 className="text-2xl md:text-3xl font-heading mb-4">Courses Topics</h2>
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
    </div>
  );
}
