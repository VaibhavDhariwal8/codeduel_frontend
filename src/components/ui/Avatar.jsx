export default function Avatar({ seed, size = 40, className = "" }) {
  const url = `https://api.dicebear.com/10.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&backgroundColor=12161F,1A1F2B,232938`;
  return (
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className={`bg-base-800 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
