"use client";

import React from "react";

interface ITab {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tab = (props: ITab) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <div className={props.className} ref={ref}>
      {props.children}
    </div>
  );
};

export const TabContainer = (props: {
  children: React.ReactElement<ITab>[] | React.ReactElement<ITab>;
  activeTab?: number;
  className?: string;
}) => {
  const children =
    props.children instanceof Array ? props.children : [props.children];
  const [activeTab, setActiveTab] = React.useState(props.activeTab ?? 0);
  return (
    <div
      className={"flex h-full w-full grow flex-col " + (props.className ?? "")}
    >
      <div className="relative">
        {children.map((child, i) => {
          return (
            <button
              key={i}
              className={["z-10 p-4 text-lg font-bold uppercase"].join(" ")}
              style={{
                width: `${100 / children.length}%`,
              }}
              onClick={() => setActiveTab(i)}
            >
              {child.props.title}
            </button>
          );
        })}
        <div
          className="absolute inset-0 z-0 border-b-2 border-jgu-red transition-all duration-200 ease-in-out"
          style={{
            width: `${100 / children.length}%`,
            transform: `translateX(${activeTab * 100}%)`,
          }}
        >
          &nbsp;
        </div>
      </div>
      <div className="h-0 w-full grow overflow-y-scroll">
        <div className="h-fit w-full">{children[activeTab]}</div>
      </div>
    </div>
  );
};
