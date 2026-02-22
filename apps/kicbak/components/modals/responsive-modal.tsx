import { useMedia } from "react-use";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Drawer, DrawerContent } from "../ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: "sm" | "md" | "lg" | "xl" | string;
  fullScreen?: boolean;
}

const modalSizeMap: Record<string, string> = {
  sm: "w-[400px]",
  md: "w-[480px]",
  lg: "w-[640px]",
  xl: "w-[800px]",
};

const drawerSizeMap: Record<string, string> = {
  sm: "w-11/12",
  md: "w-10/12",
  lg: "w-9/12",
  xl: "w-8/12",
};

const ResponsiveModal = ({
  children,
  open,
  onOpenChange,
  size = "md",
  fullScreen = false,
}: ResponsiveModalProps) => {
  const isDesktop = useMedia("(min-width: 1024px)", true);
  const dialogWidth = modalSizeMap[size] || size;
  const drawerWidth = fullScreen
    ? "w-full h-full"
    : drawerSizeMap[size] || size;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle></DialogTitle>
        <DialogContent
          className={`${dialogWidth} max-h-[85vh] overflow-y-auto`}
        >
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={`${drawerWidth} max-h-[85vh] overflow-y-auto`}>
        {children}
      </DrawerContent>
    </Drawer>
  );
};

export default ResponsiveModal;
