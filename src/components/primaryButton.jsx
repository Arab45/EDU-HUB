function PrimaryButton({ children, ...props }) {
  return (
    <button
      className="bg-background text-primary p-2 mx-4 mt-2 w-2xs border rounded font-semibold transition-colors duration-300 ease-in-out hover:bg-primary hover:text-background"
      {...props}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
