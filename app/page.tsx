import { PageTitle } from "@/components/pellet/PageTitle";
import { SectionBand } from "@/components/pellet/SectionBand";
import { RoleStatus } from "@/components/app/RoleStatus";
import { getRole } from "@/lib/auth/session";

export default async function Home() {
  const role = await getRole();

  return (
    <>
      <SectionBand tone="yellow">
        <PageTitle eyebrow="Build check · 2026/27 season" title="Hello, Wanderers." />
      </SectionBand>

      <SectionBand tone="paper">
        <div className="flex max-w-[68ch] flex-col gap-6">
          <p className="text-[20px] leading-[1.45] text-ink">
            This is the first screen of the Pellet Index. Nothing is wired to the database
            yet — this page only proves three things: the branding, the passphrases, and
            that a push to this repo reaches Vercel.
          </p>

          <RoleStatus role={role} />

          <div className="mt-2 border-t border-chalk pt-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              Last result
            </p>
            <p className="mt-2 text-[24px] font-semibold text-ink">
              Bath Old Boys United 1–2 Wanderers
            </p>
            <p className="mt-1 text-[14px] text-ink-muted">
              Southern Sunday Football League, Premier Division · Clapham Common · 6 September
              2026
            </p>
          </div>

          <p className="text-[14px] text-ink-muted">
            Didn&apos;t play, isn&apos;t on the Index yet, and the recorder doesn&apos;t exist. All
            of that is next.
          </p>
        </div>
      </SectionBand>
    </>
  );
}
