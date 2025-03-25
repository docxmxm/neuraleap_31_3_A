import Image from "next/image";
import StarRating from "@/components/ui/star-rating";

export interface TestimonialProps {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage?: string;
  rating: number;
}

export default function TestimonialCard({
  quote,
  authorName,
  authorRole,
  authorImage,
  rating,
}: TestimonialProps) {
  return (
    <div className="testimonial-card h-full flex flex-col">
      <div className="flex items-center mb-2">
        <StarRating rating={rating} className="text-star" />
      </div>

      <blockquote className="mb-4 flex-grow">
        <p className="text-sm md:text-base italic">"{quote}"</p>
      </blockquote>

      <div className="flex items-center mt-auto">
        {authorImage ? (
          <div className="mr-3 rounded-full overflow-hidden">
            <Image
              src={authorImage}
              alt={authorName}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-3">
            <span className="text-secondary-foreground font-medium">
              {authorName.charAt(0)}
            </span>
          </div>
        )}

        <div>
          <p className="font-medium text-sm">{authorName}</p>
          <p className="text-xs text-muted-foreground">{authorRole}</p>
        </div>
      </div>
    </div>
  );
}
