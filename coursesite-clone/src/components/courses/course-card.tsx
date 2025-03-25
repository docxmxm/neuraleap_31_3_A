import Link from "next/link";
import Image from "next/image";
import StarRating from "@/components/ui/star-rating";

export interface CourseCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  rating: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  isFeatured?: boolean;
  slug: string;
}

export default function CourseCard({
  title,
  price,
  imageUrl,
  rating,
  level,
  description,
  isFeatured = false,
  slug,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${slug}`} className="course-card block h-full">
      <div className="relative overflow-hidden aspect-video rounded-t-xl">
        <Image
          src={imageUrl}
          alt={title}
          width={400}
          height={225}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {isFeatured && (
          <div className="featured-badge">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <StarRating rating={rating} className="mr-2" />
          <span className="text-sm text-muted-foreground">
            ${price}
          </span>
        </div>
        <h3 className="text-lg font-medium mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center text-sm">
          <div className="level-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            {level}
          </div>
        </div>
      </div>
    </Link>
  );
}
