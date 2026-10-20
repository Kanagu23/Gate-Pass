import { useEffect, useRef, useState } from "react";
import Button from "./Button";

// JPEG is resized client-side; no dependency or permanent media stream.
export const resizePhoto = (source, width = 320, height = 320) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = Math.min(width / image.width, height / image.height, 1);
    canvas.width = Math.max(1, Math.floor(image.width * scale));
    canvas.height = Math.max(1, Math.floor(image.height * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(source);
    resolve(canvas.toDataURL("image/jpeg", 0.7));
  };
  image.onerror = () => { URL.revokeObjectURL(source); reject(new Error("Invalid image")); };
  image.src = source;
});

const PhotoCapture = ({ value = "", onChange, label = "Profile photo" }) => {
  const video = useRef(null);
  const stream = useRef(null);
  const [camera, setCamera] = useState(false);
  const [error, setError] = useState("");
  const stop = () => { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setCamera(false); };
  useEffect(() => () => stream.current?.getTracks().forEach((track) => track.stop()), []);
  useEffect(() => { if (camera && video.current && stream.current) video.current.srcObject = stream.current; }, [camera]);
  const start = async () => {
    try { setError(""); const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); stream.current = s; setCamera(true); }
    catch { setError("Camera unavailable. Use photo upload instead (HTTPS or localhost required)."); }
  };
  const capture = async () => {
    const frame = video.current;
    if (!frame?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = frame.videoWidth; canvas.height = frame.videoHeight;
    canvas.getContext("2d").drawImage(frame, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.75));
    if (!blob) return;
    try { onChange(await resizePhoto(URL.createObjectURL(blob))); stop(); }
    catch { setError("Could not capture the photo."); }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 6_000_000) { setError("Upload a photo under 6 MB."); return; }
    try { setError(""); onChange(await resizePhoto(URL.createObjectURL(file))); stop(); }
    catch { setError("Could not process image."); }
  };
  return (
    <div className="space-y-2 rounded-card border border-line bg-white p-3">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      {value && <img src={value} alt="Photo preview" className="h-28 w-28 rounded-control object-cover" />}
      {camera && <video ref={video} playsInline autoPlay muted className="h-40 w-full rounded-control bg-slate-950 object-contain" />}
      <div className="flex flex-wrap items-center gap-2">
        {!camera ? <Button type="button" size="sm" variant="secondary" onClick={start}>Open camera</Button> : <><Button type="button" size="sm" onClick={capture}>Capture</Button><Button type="button" size="sm" variant="secondary" onClick={stop}>Cancel</Button></>}
        <label className="cursor-pointer rounded-control border border-line px-3 py-2 text-xs font-medium text-slate-700">Upload photo<input type="file" accept="image/*" capture="user" className="sr-only" onChange={upload} /></label>
        {value && <Button size="sm" type="button" variant="secondary" onClick={() => onChange("")}>Remove</Button>}
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
};
export default PhotoCapture;
