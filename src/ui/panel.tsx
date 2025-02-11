import React from "react";

export const Panel = (props: {
  noExpand?: boolean;
  children: React.ReactNode;
  className?: string;
  reduceTopPadding?: boolean;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (props.noExpand) {
      setWidth(containerRef.current?.scrollHeight ?? 0);
    }
  }, [props.noExpand]);

  return (
    <div
      className={
        "absolute left-4 right-5 top-5 flex max-w-96 flex-col items-start gap-10 rounded-xl transition-all duration-200 ease-in-out md:right-auto" +
        (props.reduceTopPadding ? " top-5" : "top-5")
      }
      style={{
        height: width == 0 || props.noExpand ? "3.5rem" : "20rem",
      }}
    >
      {!props.noExpand ? (
        <div className="pointer-events-none w-full">
          <button
            className={
              "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-jgu-gray p-4 shadow-sm transition-all duration-200 ease-in-out hover:scale-110 hover:bg-jgu-red " +
              (props.reduceTopPadding ? "" : "ml-20")
            }
            onClick={() => {
              if (width == 0) {
                setWidth(containerRef.current?.scrollWidth ?? 0);
              } else {
                setWidth(0);
              }
            }}
          >
            {width == 0 ? (
              <i className="bi bi-chevron-down text-white"></i>
            ) : (
              <i className="bi bi-chevron-up text-white"></i>
            )}
          </button>
        </div>
      ) : null}
      <div
        className="transition-[width, opacity] flex h-full w-full grow flex-col gap-3 overflow-hidden rounded-xl bg-jgu-gray/60 shadow-xl backdrop-blur duration-200 ease-in-out"
        ref={containerRef}
        style={{
          opacity: width == 0 ? 0 : 1,
        }}
      >
        <div className="h-full overflow-y-scroll p-8">
          <div className="h-fit">{props.children}</div>
        </div>
      </div>
    </div>
  );
};
