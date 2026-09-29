import React from "react";
import { cn } from "@/lib/utils";

const LOGO_URL =
  "https://media.base44.com/images/public/6aba37ff7da4664ca6e1344d/191662f6a_ChatGPTImageSep28202603_28_45PM.png";

export function LogoMark({ size = 36, className }) {
  return (
    <img
      src={LOGO_URL}
      alt="PropWise"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

export default function Logo({ size = 36, showTagline = false, className }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={LOGO_URL}
        alt="PropWise"
        style={{ height: size, width: "auto" }}
        className="object-contain"
        draggable={false}
      />
    </span>
  );
}