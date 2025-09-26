import { parseAsBoolean, useQueryState } from "nuqs";
export const useRequestInviteModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "request-invite",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return {
    isOpen,
    open,
    close,
    setIsOpen,
  };
};
