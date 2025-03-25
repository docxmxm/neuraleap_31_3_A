import React from "react";

interface BenefitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function BenefitCard({ title, description, icon }: BenefitCardProps) {
  return (
    <div className="benefit-card h-full flex flex-col">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
