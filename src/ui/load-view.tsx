export const LoadView = (props: { loading?: boolean }) => {
  return (
    <div
      className={
        "pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-500/60 backdrop-blur transition-[opacity] duration-300 ease-in-out " +
        (props.loading ? "opacity-100" : "opacity-0")
      }
    >
      <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full bg-jgu-gray p-4 text-neutral-50">
        <i className="bi bi-arrow-clockwise text-xl"></i>
      </div>
    </div>
  );
};
