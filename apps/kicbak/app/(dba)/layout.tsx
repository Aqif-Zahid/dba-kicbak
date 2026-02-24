import type { ReactNode } from "react";
import styles from "./_styles/dba.module.css";

export default function DBALayout({ children }: { children: ReactNode }) {
  return <div className={styles.dbaRoot}>{children}</div>;
}
