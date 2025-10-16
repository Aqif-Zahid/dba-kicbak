import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ChannelHeader, ChannelHeaderProps } from "stream-chat-react";

interface CustomerChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

export const CustomerChannelHeader = ({
  openSidebar,
  ...props
}: CustomerChannelHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="h-full p-2 md:hidden ">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
};
