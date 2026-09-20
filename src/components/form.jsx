function FormField({ label, type = "text", placeholder }) {
  return (
    <div>
      <label className="mx-4 font-semibold text-slate-900">{label}</label>
      <br />
      <input
        type={type}
        className="border rounded p-1.5 mb-2 w-2xs mx-4 transition-colors duration-300 ease-in-out border-slate-300 focus:border-orange-400 focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
}

export default FormField;
