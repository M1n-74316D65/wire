import { Shell } from "@/components/Shell";

export default function SummarizeLoading() {
  return (
    <Shell>
      <div className="brief-page">
        <p className="brief-loading">Writing the brief…</p>
        <div className="brief-loading__bar" />
        <div className="brief-loading__bar" />
        <div className="brief-loading__bar brief-loading__bar--last" />
      </div>
    </Shell>
  );
}
