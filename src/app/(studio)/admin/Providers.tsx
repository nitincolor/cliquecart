"use client";
import { ModalProvider } from "../../context/QuickViewModalContext";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../../context/PreviewSliderContext";
import CartProvider from "@/components/Providers/CartProvider";
import { SessionProvider } from "next-auth/react";


const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <CartProvider>
        <ModalProvider>
          <PreviewSliderProvider>
            {children}
            <CartSidebarModal />
          </PreviewSliderProvider>
        </ModalProvider>
      </CartProvider>
    </SessionProvider>
  );
};

export default Providers;
