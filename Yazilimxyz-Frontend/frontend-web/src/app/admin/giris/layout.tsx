import React, { ReactNode } from 'react';

// children prop'unun tipini doğru şekilde belirtmek için ReactNode kullanılır.
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Burada tüm giriş sayfası için geçerli bir layout yapısı olabilir. */}
      {/* Örneğin, bir arka plan, başlıklar veya ortak bir kapsayıcı. */}
      {children}
    </div>
  );
};

export default Layout;