import { parseAsBoolean, useQueryState } from "nuqs";
export const useResetPasswordModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "reset-password",
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
