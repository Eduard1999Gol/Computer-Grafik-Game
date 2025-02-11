import React from "react";

export const Label = (props: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={"flex w-full flex-col items-stretch gap-2 pb-2 " + props.className}
    >
      <div className="text-sm font-bold uppercase text-neutral-50">
        {props.title}
      </div>
      <div className="text-sm">{props.children}</div>
    </div>
  );
};
