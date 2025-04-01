"use client";

import { usePathname, useRouter } from "next/navigation";

export const BackButton = (props: { onClick: () => void }) => {
  return (
    <button
      className="absolute left-4 top-4 z-100 flex h-16 w-16 items-center justify-center rounded-full bg-jgu-gray text-white transition-all duration-200 hover:scale-110 hover:bg-jgu-red active:scale-100"
      onClick={props.onClick}
    >
      <i className="bi bi-arrow-left text-3xl"></i>
    </button>
  );
};

export const AutoBackButton = () => {
  const pathname = usePathname();

  const router = useRouter();

  if (pathname === "/") {
    return null;
  }

  return (
    <BackButton
      onClick={() => {
        router.push("/");
      }}
    />
  );
};
