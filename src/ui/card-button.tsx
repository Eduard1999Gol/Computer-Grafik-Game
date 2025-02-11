export const CardButton = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    onClick?: () => void;
    children?: React.ReactNode;
  },
) => {
  return (
    <button
      {...props}
      onClick={props.onClick}
      className="pointer-events-auto h-36 w-36 rounded-xl bg-jgu-gray p-2 pl-4 pr-4 uppercase text-neutral-50 transition-all duration-200 ease-in-out hover:scale-110 active:scale-100"
    >
      {props.children ?? <>&nbsp;</>}
    </button>
  );
};

export const CardButtonGroup = (props: { children?: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-y-scroll pt-24">
      {props.children}
    </div>
  );
};
