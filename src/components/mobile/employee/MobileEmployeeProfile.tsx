"use client";

import { MobileProfileSettings } from "../MobileProfileSettings";

interface MobileEmployeeProfileProps {
  user: any;
}

export function MobileEmployeeProfile({ user }: MobileEmployeeProfileProps) {
  return <MobileProfileSettings user={user} />;
}
