import Spinner from "./Spinner";
import { buttonStyles } from "./buttonStyles";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  loadingText,
  className = "",
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`${buttonStyles(variant, size)} ${className}`}
    {...props}
  >
    {loading && <Spinner size={size === "sm" ? 12 : 14} />}
    {loading && loadingText ? loadingText : children}
  </button>
);

export default Button;
