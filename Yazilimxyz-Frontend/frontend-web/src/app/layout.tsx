import ChatWidget from "@/components/customer/ChatWidget";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}
  <ChatWidget/>
  </>;
}
