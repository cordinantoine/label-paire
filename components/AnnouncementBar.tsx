"use client";

import { useT } from "@/hooks/useT";
import { tr } from "@/lib/i18n";

export default function AnnouncementBar() {
  const { t } = useT();
  return (
    <div className="bg-[#ff9ed5] text-[#0a0a0a] text-xs font-semibold text-center py-2 tracking-wide">
      {t(tr.announcement)}
    </div>
  );
}
