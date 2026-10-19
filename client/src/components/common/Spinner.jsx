import { Loader2 } from "lucide-react";

const Spinner = ({ size = 15, className = "" }) => (
  <Loader2
    size={size}
    aria-hidden="true"
    className={`animate-spin ${className}`}
  />
);

export default Spinner;
