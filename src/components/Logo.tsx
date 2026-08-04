import { useTheme } from "@/hooks/use-theme";
import { ImgHTMLAttributes } from "react";

type LogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;

export function Logo({ alt = "Clockocus", ...props }: LogoProps) {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/logo-dark.png" : "/logo.png";
  return <img src={src} alt={alt} {...props} />;
}
