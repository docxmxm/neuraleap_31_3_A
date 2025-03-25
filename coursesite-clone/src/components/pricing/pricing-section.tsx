import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  title: string;
  price: number;
  period: string;
  description: string;
  features: PricingFeature[];
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
}

interface PricingSectionProps {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

export default function PricingSection({ title, subtitle, plans }: PricingSectionProps) {
  return (
    <section className="py-12 md:py-16" id="pricing">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>

          <div className="flex items-center justify-center mt-6 mb-8">
            <div className="flex items-center space-x-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-yellow-500"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-medium">4.8/5</span>
            </div>
            <div className="w-px h-4 bg-border mx-4"></div>
            <span className="text-sm text-muted-foreground">5,467 Reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card flex flex-col ${plan.isPopular ? 'popular' : ''}`}
            >
              <h3 className="text-lg font-medium mb-1">{plan.title}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-1">/{plan.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <div className="mr-2 mt-0.5 text-primary">
                      <Check size={16} />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.buttonLink} className="mt-auto">
                <Button
                  className={`w-full rounded-md ${
                    plan.isPopular
                      ? 'bg-primary hover:bg-primary/90 text-white'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
