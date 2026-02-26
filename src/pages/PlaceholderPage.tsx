import { useLocation } from "react-router-dom";

const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const title = pathname
    .slice(1)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="flex min-h-[50vh] items-center justify-center animate-fade-in">
      <div className="text-center">
        <h1 className="text-heading text-foreground">{title}</h1>
        <p className="mt-2 text-body-4 text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
