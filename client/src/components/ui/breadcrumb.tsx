import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  separator?: React.ReactNode;
  className?: string;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ separator = <ChevronRight className="h-4 w-4" />, className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn(
          "flex items-center text-sm text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
  return (
    <a
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("text-muted-foreground", className)}
    {...props}
  >
    {children || <ChevronRight className="h-3.5 w-3.5" />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export interface BreadcrumbItemProps {
  href?: string;
  label: string;
  isCurrent?: boolean;
}

export interface BreadcrumbsProps extends React.ComponentProps<"nav"> {
  items: BreadcrumbItemProps[];
  className?: string;
  homeHref?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ 
  items, 
  className, 
  homeHref = "/",
  showHome = true,
  ...props 
}: BreadcrumbsProps) {
  return (
    <Breadcrumb className={cn("mb-6", className)} {...props}>
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              <Link href={homeHref}>
                <BreadcrumbLink className="flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:inline">Home</span>
                </BreadcrumbLink>
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={item.label}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href ? (
                  <Link href={item.href}>
                    <BreadcrumbLink>{item.label}</BreadcrumbLink>
                  </Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}