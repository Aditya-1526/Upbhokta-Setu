import { useLanguage } from "../hooks/useLanguage";

const COLORS = {
  primary: "#1B5E20",
  primaryLight: "#E8F5E9",
  surface: "#FFFFFF",
  background: "#FAFAFA",
  text: "#212121",
  textSecondary: "#757575",
  textInverse: "#FFFFFF",
  border: "#E0E0E0",
  error: "#D32F2F",
  warning: "#F57C00",
  success: "#388E3D",
};

export { COLORS };

type LayoutProps = {
  title?: string;
  children: React.ReactNode;
};

export function Layout({ title, children }: LayoutProps) {
  const { t } = useLanguage();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>
          <span style={styles.logoIcon}>उ</span>
          <span>{t.appName}</span>
        </h1>
        <p style={styles.tagline}>{t.tagline}</p>
      </header>
      <main style={styles.main}>
        {title && <h2 style={styles.pageTitle}>{title}</h2>}
        {children}
      </main>
      <nav style={styles.nav}>
        <NavLink to="/cases" icon="📋" label={t.navCases} />
        <NavLink to="/create" icon="➕" label={t.navCreate} />
        <NavLink to="/settings" icon="⚙️" label={t.navSettings} />
      </nav>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <a href={to} style={styles.navLink}>
      <span style={styles.navIcon}>{icon}</span>
      <span style={styles.navLabel}>{label}</span>
    </a>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: COLORS.background,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    backgroundColor: COLORS.primary,
    color: COLORS.textInverse,
    padding: "16px 24px",
    textAlign: "center" as const,
  },
  logo: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 700,
  },
  tagline: {
    margin: "4px 0 0",
    fontSize: 13,
    opacity: 0.85,
  },
  main: {
    flex: 1,
    padding: "20px 16px 80px",
    maxWidth: 720,
    width: "100%",
    margin: "0 auto",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: 16,
  },
  nav: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: COLORS.surface,
    borderTop: `1px solid ${COLORS.border}`,
    padding: "8px 0",
    paddingBottom: "max(8px, env(safe-area-inset-bottom))",
    zIndex: 100,
  },
  navLink: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 2,
    textDecoration: "none",
    color: COLORS.textSecondary,
    fontSize: 11,
    padding: "4px 12px",
    borderRadius: 8,
  },
  navIcon: { fontSize: 20 },
  navLabel: { fontWeight: 500 },
};
