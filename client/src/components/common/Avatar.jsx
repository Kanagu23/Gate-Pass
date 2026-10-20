const tones = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const initialsOf = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const Avatar = ({ name = "", size = 28, className = "", src = "" }) => {
  const tone = tones[(name.charCodeAt(0) || 0) % tones.length];
  if (src) return <img src={src} alt={name || "Profile"} width={size} height={size} className={`inline-block shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${tone} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
};

export default Avatar;
